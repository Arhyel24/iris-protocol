/*!
IRIS Protocol  On-chain Insurance Bridge v2
=============================================
 1. initialize_treasury   Admin/oracle: creates the global Treasury PDA.
 2. purchase_policy       User: pays first month + delegates remaining months.
 3. pay_monthly_premium   Oracle: collects recurring premium, records on-chain.
 4. trigger_payout        Oracle: releases claim payout, records on-chain.
 5. expire_policy         Oracle: marks a policy Expired after its end date.
*/

use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hashv;
use anchor_spl::token::{self, Approve, Token, TokenAccount, Transfer};

declare_id!("ECDThuwStZ4a1ksQE2C9wakVoa4RYtBp5e7YAXsTJCHN");

const MONTH_SECONDS: i64 = 30 * 24 * 60 * 60;

#[program]
pub mod iris_insurance_bridge {
    use super::*;

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let t = &mut ctx.accounts.treasury_state;
        t.admin = ctx.accounts.admin.key();
        t.total_premiums_collected = 0;
        t.total_payouts = 0;
        Ok(())
    }

    pub fn purchase_policy(
        ctx: Context<PurchasePolicy>,
        quote_id: String,
        monthly_premium: u64,
        duration_months: u32,
    ) -> Result<()> {
        require!(duration_months >= 1, ErrorCode::InvalidDuration);
        require!(monthly_premium > 0, ErrorCode::InvalidPremium);

        let clock = Clock::get()?;
        let policy = &mut ctx.accounts.policy_state;
        let treasury = &mut ctx.accounts.treasury_state;

        policy.owner = ctx.accounts.user.key();
        policy.quote_id = quote_id.clone();
        policy.monthly_premium = monthly_premium;
        policy.duration_months = duration_months;
        policy.payments_made = 0;
        policy.payouts_count = 0;
        policy.status = PolicyStatus::Active;
        policy.expiry_timestamp =
            clock.unix_timestamp + (duration_months as i64 * MONTH_SECONDS);

        // Pay first month immediately
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_usdc.to_account_info(),
                    to: ctx.accounts.treasury_usdc.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            monthly_premium,
        )?;

        policy.payments_made = 1;
        policy.next_payment_due = clock.unix_timestamp + MONTH_SECONDS;
        treasury.total_premiums_collected = treasury
            .total_premiums_collected
            .checked_add(monthly_premium)
            .ok_or(ErrorCode::Overflow)?;

        // Approve treasury PDA as delegate for remaining months
        let remaining = monthly_premium
            .checked_mul(duration_months.saturating_sub(1) as u64)
            .ok_or(ErrorCode::Overflow)?;
        if remaining > 0 {
            token::approve(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Approve {
                        to: ctx.accounts.user_usdc.to_account_info(),
                        delegate: ctx.accounts.treasury_state.to_account_info(),
                        authority: ctx.accounts.user.to_account_info(),
                    },
                ),
                remaining,
            )?;
        }

        // Record first payment on-chain
        let rec = &mut ctx.accounts.first_premium_record;
        rec.policy = policy.key();
        rec.payment_index = 0;
        rec.amount = monthly_premium;
        rec.paid_at = clock.unix_timestamp;

        emit!(PolicyPurchased {
            owner: policy.owner,
            quote_id,
            monthly_premium,
            duration_months,
            expiry_timestamp: policy.expiry_timestamp,
        });
        emit!(PremiumPaid {
            policy: policy.key(),
            owner: policy.owner,
            payment_index: 0,
            amount: monthly_premium,
            paid_at: clock.unix_timestamp,
        });
        Ok(())
    }

    /// Oracle collects the recurring monthly premium via pre-approved delegation.
    /// `payment_index` must equal `policy.payments_made`.
    pub fn pay_monthly_premium(
        ctx: Context<PayMonthlyPremium>,
        payment_index: u32,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let policy = &mut ctx.accounts.policy_state;
        let treasury = &mut ctx.accounts.treasury_state;

        require!(ctx.accounts.oracle.key() == treasury.admin, ErrorCode::UnauthorizedOracle);
        require!(policy.status == PolicyStatus::Active, ErrorCode::PolicyNotActive);
        require!(payment_index == policy.payments_made, ErrorCode::InvalidPaymentIndex);
        require!(policy.payments_made < policy.duration_months, ErrorCode::AllPaymentsMade);
        require!(clock.unix_timestamp >= policy.next_payment_due, ErrorCode::PaymentNotYetDue);

        let amount = policy.monthly_premium;
        let admin_key = treasury.admin.to_bytes();
        let seeds: &[&[u8]] = &[b"treasury", admin_key.as_ref(), &[ctx.bumps.treasury_state]];
        let signer = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_usdc.to_account_info(),
                    to: ctx.accounts.treasury_usdc.to_account_info(),
                    authority: treasury.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        let rec = &mut ctx.accounts.premium_record;
        rec.policy = policy.key();
        rec.payment_index = payment_index;
        rec.amount = amount;
        rec.paid_at = clock.unix_timestamp;

        policy.payments_made += 1;
        policy.next_payment_due = clock.unix_timestamp + MONTH_SECONDS;
        treasury.total_premiums_collected = treasury
            .total_premiums_collected
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        emit!(PremiumPaid {
            policy: policy.key(),
            owner: policy.owner,
            payment_index,
            amount,
            paid_at: clock.unix_timestamp,
        });
        Ok(())
    }

    /// Oracle releases claim payout from Treasury to user.
    /// `payout_index` must equal `policy.payouts_count`.
    pub fn trigger_payout(
        ctx: Context<TriggerPayout>,
        claim_id: String,
        payout_amount: u64,
        payout_index: u32,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let treasury = &mut ctx.accounts.treasury_state;
        let policy = &mut ctx.accounts.policy_state;

        require!(ctx.accounts.admin.key() == treasury.admin, ErrorCode::UnauthorizedOracle);
        require!(policy.status == PolicyStatus::Active, ErrorCode::PolicyNotActive);
        require!(payout_index == policy.payouts_count, ErrorCode::InvalidPayoutIndex);
        require!(payout_amount > 0, ErrorCode::InvalidPremium);

        policy.status = PolicyStatus::Claimed;
        policy.payouts_count += 1;

        let admin_key = treasury.admin.to_bytes();
        let seeds: &[&[u8]] = &[b"treasury", admin_key.as_ref(), &[ctx.bumps.treasury_state]];
        let signer = &[seeds];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.treasury_usdc.to_account_info(),
                    to: ctx.accounts.user_usdc.to_account_info(),
                    authority: treasury.to_account_info(),
                },
                signer,
            ),
            payout_amount,
        )?;

        let rec = &mut ctx.accounts.payout_record;
        rec.policy = policy.key();
        rec.claim_id = claim_id.clone();
        rec.amount = payout_amount;
        rec.paid_at = clock.unix_timestamp;

        treasury.total_payouts = treasury
            .total_payouts
            .checked_add(payout_amount)
            .ok_or(ErrorCode::Overflow)?;

        emit!(PayoutTriggered {
            owner: policy.owner,
            claim_id,
            payout_amount,
            paid_at: clock.unix_timestamp,
        });
        Ok(())
    }

    pub fn expire_policy(ctx: Context<ExpirePolicy>) -> Result<()> {
        let clock = Clock::get()?;
        let policy = &mut ctx.accounts.policy_state;
        let treasury = &ctx.accounts.treasury_state;

        require!(ctx.accounts.oracle.key() == treasury.admin, ErrorCode::UnauthorizedOracle);
        require!(policy.status == PolicyStatus::Active, ErrorCode::PolicyNotActive);
        require!(clock.unix_timestamp >= policy.expiry_timestamp, ErrorCode::PolicyNotExpiredYet);

        policy.status = PolicyStatus::Expired;

        emit!(PolicyExpired {
            policy: policy.key(),
            owner: policy.owner,
            expired_at: clock.unix_timestamp,
        });
        Ok(())
    }
}

//  Account Constraints 

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init, payer = admin, space = 8 + TreasuryState::LEN,
        seeds = [b"treasury", admin.key().as_ref()], bump
    )]
    pub treasury_state: Account<'info, TreasuryState>,
    #[account(mut)] pub treasury_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(quote_id: String)]
pub struct PurchasePolicy<'info> {
    #[account(
        init, payer = user, space = 8 + PolicyState::LEN,
        seeds = [b"policy", user.key().as_ref(), &hashv(&[quote_id.as_bytes()]).to_bytes()], bump
    )]
    pub policy_state: Account<'info, PolicyState>,

    #[account(
        init, payer = user, space = 8 + PremiumRecord::LEN,
        seeds = [b"premium", policy_state.key().as_ref(), &0u32.to_le_bytes()], bump
    )]
    pub first_premium_record: Account<'info, PremiumRecord>,

    #[account(mut, seeds = [b"treasury", treasury_state.admin.as_ref()], bump)]
    pub treasury_state: Account<'info, TreasuryState>,
    #[account(mut)] pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub treasury_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(payment_index: u32)]
pub struct PayMonthlyPremium<'info> {
    #[account(
        init, payer = oracle, space = 8 + PremiumRecord::LEN,
        seeds = [b"premium", policy_state.key().as_ref(), &payment_index.to_le_bytes()], bump
    )]
    pub premium_record: Account<'info, PremiumRecord>,

    #[account(mut)] pub policy_state: Account<'info, PolicyState>,
    #[account(mut, seeds = [b"treasury", treasury_state.admin.as_ref()], bump)]
    pub treasury_state: Account<'info, TreasuryState>,
    #[account(mut)] pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub treasury_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub oracle: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(claim_id: String, payout_amount: u64, payout_index: u32)]
pub struct TriggerPayout<'info> {
    #[account(
        init, payer = admin, space = 8 + PayoutRecord::LEN,
        seeds = [b"payout", policy_state.key().as_ref(), &payout_index.to_le_bytes()], bump
    )]
    pub payout_record: Account<'info, PayoutRecord>,

    #[account(mut, seeds = [b"treasury", treasury_state.admin.as_ref()], bump)]
    pub treasury_state: Account<'info, TreasuryState>,
    #[account(mut)] pub policy_state: Account<'info, PolicyState>,
    #[account(mut)] pub treasury_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut)] pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExpirePolicy<'info> {
    #[account(mut)] pub policy_state: Account<'info, PolicyState>,
    #[account(seeds = [b"treasury", treasury_state.admin.as_ref()], bump)]
    pub treasury_state: Account<'info, TreasuryState>,
    pub oracle: Signer<'info>,
}

//  Account Data 

#[account]
pub struct TreasuryState {
    pub admin: Pubkey,
    pub total_premiums_collected: u64,
    pub total_payouts: u64,
}
impl TreasuryState { pub const LEN: usize = 32 + 8 + 8; }

#[account]
pub struct PolicyState {
    pub owner: Pubkey,
    pub quote_id: String,
    pub monthly_premium: u64,
    pub duration_months: u32,
    pub payments_made: u32,
    pub payouts_count: u32,
    pub next_payment_due: i64,
    pub expiry_timestamp: i64,
    pub status: PolicyStatus,
}
impl PolicyState { pub const LEN: usize = 200; }

#[account]
pub struct PremiumRecord {
    pub policy: Pubkey,
    pub payment_index: u32,
    pub amount: u64,
    pub paid_at: i64,
}
impl PremiumRecord { pub const LEN: usize = 32 + 4 + 8 + 8; }

#[account]
pub struct PayoutRecord {
    pub policy: Pubkey,
    pub claim_id: String,
    pub amount: u64,
    pub paid_at: i64,
}
impl PayoutRecord { pub const LEN: usize = 32 + 68 + 8 + 8; }

//  Enums 

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum PolicyStatus { Active, Expired, Claimed }

//  Events 

#[event]
pub struct PolicyPurchased {
    pub owner: Pubkey, pub quote_id: String,
    pub monthly_premium: u64, pub duration_months: u32, pub expiry_timestamp: i64,
}

#[event]
pub struct PremiumPaid {
    pub policy: Pubkey, pub owner: Pubkey,
    pub payment_index: u32, pub amount: u64, pub paid_at: i64,
}

#[event]
pub struct PayoutTriggered {
    pub owner: Pubkey, pub claim_id: String,
    pub payout_amount: u64, pub paid_at: i64,
}

#[event]
pub struct PolicyExpired {
    pub policy: Pubkey, pub owner: Pubkey, pub expired_at: i64,
}

//  Errors 

#[error_code]
pub enum ErrorCode {
    #[msg("Oracle key must match treasury.admin")] UnauthorizedOracle,
    #[msg("Policy is not in Active status")] PolicyNotActive,
    #[msg("Policy expiry date has not yet passed")] PolicyNotExpiredYet,
    #[msg("Payment is not yet due")] PaymentNotYetDue,
    #[msg("All scheduled payments have already been collected")] AllPaymentsMade,
    #[msg("Payment index does not match expected")] InvalidPaymentIndex,
    #[msg("Payout index does not match expected")] InvalidPayoutIndex,
    #[msg("Duration must be at least 1 month")] InvalidDuration,
    #[msg("Amount must be greater than zero")] InvalidPremium,
    #[msg("Arithmetic overflow")] Overflow,
}
