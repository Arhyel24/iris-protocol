use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("CyU7VZwLetQ2sCGqhj7gBbS2rojWrobNGGbQHFchNWFM");

#[program]
pub mod iris_insurance_bridge {
    use super::*;

    // Initialize the main Treasury that holds user premiums
    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_state;
        treasury.admin = ctx.accounts.admin.key();
        treasury.total_premiums_collected = 0;
        treasury.total_payouts = 0;
        Ok(())
    }

    // User purchases a policy by locking USDC in the Escrow
    pub fn purchase_policy(
        ctx: Context<PurchasePolicy>,
        quote_id: String,
        duration_days: u32,
        premium_amount: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let policy = &mut ctx.accounts.policy_state;
        let treasury = &mut ctx.accounts.treasury_state;

        // Save policy metadata
        policy.owner = ctx.accounts.user.key();
        policy.quote_id = quote_id.clone();
        policy.premium_paid = premium_amount;
        policy.status = PolicyStatus::Active;
        policy.expiry_timestamp = clock.unix_timestamp + (duration_days as i64 * 86400);

        // Transfer premium from User to Treasury Escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.user_usdc.to_account_info(),
                    to: ctx.accounts.treasury_usdc.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            premium_amount,
        )?;

        treasury.total_premiums_collected = treasury
            .total_premiums_collected
            .checked_add(premium_amount)
            .unwrap();

        emit!(PolicyPurchased {
            owner: policy.owner,
            quote_id,
            premium_amount,
            expiry_timestamp: policy.expiry_timestamp,
        });

        Ok(())
    }

    // Admin (Oracle) triggers fiat-claim payout securely back to the user on-chain
    pub fn trigger_payout(
        ctx: Context<TriggerPayout>,
        claim_id: String,
        payout_amount: u64,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury_state;
        let policy = &mut ctx.accounts.policy_state;

        // Only the designated admin (oracle) can trigger payouts
        require!(
            ctx.accounts.admin.key() == treasury.admin,
            ErrorCode::UnauthorizedOracle
        );

        require!(
            policy.status == PolicyStatus::Active,
            ErrorCode::PolicyNotActive
        );

        // Update Policy Status
        policy.status = PolicyStatus::Claimed;
        
        // Treasury PDA Signer Seeds
        let admin_key = treasury.admin.key();
        let treasury_seeds = &["treasury".as_bytes(), admin_key.as_ref(), &[ctx.bumps.treasury_state]];
        let signer = &[&treasury_seeds[..]];

        // Transfer Payout from Treasury back to User Escrow
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.treasury_usdc.to_account_info(),
                    to: ctx.accounts.user_usdc.to_account_info(),
                    authority: treasury.to_account_info(),
                },
                signer,
            ),
            payout_amount,
        )?;

        treasury.total_payouts = treasury
            .total_payouts
            .checked_add(payout_amount)
            .unwrap();

        emit!(PayoutTriggered {
            owner: policy.owner,
            claim_id,
            payout_amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + TreasuryState::LEN,
        seeds = [b"treasury", admin.key().as_ref()],
        bump
    )]
    pub treasury_state: Account<'info, TreasuryState>,
    
    #[account(mut)]
    pub treasury_usdc: Account<'info, TokenAccount>, // PDA Owned Token Account
    
    #[account(mut)]
    pub admin: Signer<'info>, // Backend Oracle Key
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(quote_id: String)]
pub struct PurchasePolicy<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + PolicyState::LEN,
        seeds = [b"policy", user.key().as_ref(), quote_id.as_bytes()],
        bump
    )]
    pub policy_state: Account<'info, PolicyState>,

    #[account(mut)]
    pub treasury_state: Account<'info, TreasuryState>,
    
    #[account(mut)]
    pub user_usdc: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub treasury_usdc: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TriggerPayout<'info> {
    #[account(mut)]
    pub treasury_state: Account<'info, TreasuryState>,
    
    #[account(mut)]
    pub policy_state: Account<'info, PolicyState>,
    
    #[account(mut)]
    pub treasury_usdc: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_usdc: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub admin: Signer<'info>, // Must match treasury.admin
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TreasuryState {
    pub admin: Pubkey,
    pub total_premiums_collected: u64,
    pub total_payouts: u64,
}

#[account]
pub struct PolicyState {
    pub owner: Pubkey,
    pub quote_id: String,
    pub premium_paid: u64,
    pub expiry_timestamp: i64,
    pub status: PolicyStatus,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum PolicyStatus {
    Active,
    Expired,
    Claimed,
}

impl TreasuryState {
    pub const LEN: usize = 32 + 8 + 8;
}

impl PolicyState {
    pub const LEN: usize = 32 + 64 + 8 + 8 + 1; // Generous quote_id len
}

#[event]
pub struct PolicyPurchased {
    pub owner: Pubkey,
    pub quote_id: String,
    pub premium_amount: u64,
    pub expiry_timestamp: i64,
}

#[event]
pub struct PayoutTriggered {
    pub owner: Pubkey,
    pub claim_id: String,
    pub payout_amount: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized Oracle Key")]
    UnauthorizedOracle,
    #[msg("Policy is not active")]
    PolicyNotActive,
}