use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};
use anchor_spl::associated_token::AssociatedToken;
use std::collections::BTreeMap;

declare_id!("CyU7VZwLetQ2sCGqhj7gBbS2rojWrobNGGbQHFchNWFM");

#[program]
pub mod iris_anchor {
    use super::*;

    // Initialize a new user account with default preferences
    pub fn initialize_user(ctx: Context<InitializeUser>, preferences: RiskParams) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.wallet = ctx.accounts.user.key();
        user_account.preferences = preferences;
        user_account.active_sub = false;
        user_account.score_history = Vec::new();
        Ok(())
    }

    // Subscribe to a protection plan
    pub fn subscribe(
        ctx: Context<Subscribe>,
        plan_id: u8,
        duration: u64,
        payment_amount: u64,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let clock = Clock::get()?;
        
        // Verify payment matches the plan requirements
        let plan = SubscriptionPlan::get_plan(plan_id)?;
        require!(payment_amount >= plan.price, ErrorCode::InsufficientPayment);
        
        // Update user subscription status
        user_account.active_sub = true;
        user_account.subscription_expiry = clock.unix_timestamp + duration as i64;
        
        // Transfer payment to IRIS treasury
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.payment_account.to_account_info(),
                    to: ctx.accounts.treasury_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            payment_amount,
        )?;
        
        emit!(SubscriptionEvent {
            wallet: user_account.wallet,
            plan_id,
            expiry: user_account.subscription_expiry,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    // Update risk score from off-chain oracle
    pub fn update_risk_score(
        ctx: Context<UpdateRiskScore>,
        score: u8,
        timestamp: i64,
        signature: [u8; 64],
    ) -> Result<()> {
        // Verify the signature from the IRIS risk oracle
        let message = ScoreMessage {
            wallet: ctx.accounts.user_account.wallet,
            score,
            timestamp,
        };
        
        verify_iris_signature(&message, &signature)?;
        
        // Store the score
        let user_account = &mut ctx.accounts.user_account;
        user_account.score_history.push(Score {
            value: score,
            timestamp,
        });
        
        // Check if protection triggers are needed
        check_protection_triggers(user_account)?;
        
        Ok(())
    }

    // Mint an insurance NFT
    pub fn mint_insurance_nft(
        ctx: Context<MintInsuranceNft>,
        tier: u8,
        payout_cap: u64,
        duration: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let user_account = &ctx.accounts.user_account;
        
        // Verify user has active subscription
        require!(user_account.active_sub, ErrorCode::NoActiveSubscription);
        require!(clock.unix_timestamp < user_account.subscription_expiry, ErrorCode::SubscriptionExpired);
        
        // Mint NFT
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.insurance_nft_account.to_account_info(),
                authority: ctx.accounts.iris_authority.to_account_info(),
            },
        );
        token::mint_to(cpi_ctx, 1)?;
        
        // Store NFT metadata
        let insurance_nft = &mut ctx.accounts.insurance_nft;
        insurance_nft.tier = tier;
        insurance_nft.expiry = clock.unix_timestamp + duration as i64;
        insurance_nft.payout_cap = payout_cap;
        insurance_nft.token_mint = ctx.accounts.mint.key();
        insurance_nft.owner = user_account.wallet;
        
        emit!(InsuranceNftMinted {
            wallet: user_account.wallet,
            mint: ctx.accounts.mint.key(),
            tier,
            expiry: insurance_nft.expiry,
            payout_cap: payout_cap,
        });
        
        Ok(())
    }

    // Trigger a protection action (swap, freeze, etc.)
    pub fn trigger_protection(
        ctx: Context<TriggerProtection>,
        action_type: ProtectionAction,
        token: Pubkey,
        amount: u64,
    ) -> Result<()> {
        let user_account = &ctx.accounts.user_account;
        let clock = Clock::get()?;
        
        // Verify user has active protection
        require!(user_account.active_sub, ErrorCode::NoActiveSubscription);
        require!(clock.unix_timestamp < user_account.subscription_expiry, ErrorCode::SubscriptionExpired);
        
        // Execute the protection action
        match action_type {
            ProtectionAction::Swap => {
                // Would integrate with DEX like Orca or Saber
                // Simplified for this example
                emit!(ProtectionTriggered {
                    wallet: user_account.wallet,
                    action: "SWAP".to_string(),
                    token,
                    amount,
                    timestamp: clock.unix_timestamp,
                });
            }
            ProtectionAction::Freeze => {
                emit!(ProtectionTriggered {
                    wallet: user_account.wallet,
                    action: "FREEZE".to_string(),
                    token,
                    amount,
                    timestamp: clock.unix_timestamp,
                });
            }
            _ => return Err(ErrorCode::InvalidAction.into()),
        }
        
        // Log the action
        let action_log = &mut ctx.accounts.action_log;
        action_log.timestamp = clock.unix_timestamp;
        action_log.trigger_type = action_type;
        action_log.token = token;
        action_log.score = user_account.score_history.last().unwrap().value;
        
        Ok(())
    }

    // Initiate a claim process
    pub fn initiate_claim(
        ctx: Context<InitiateClaim>,
        claim_amount: u64,
        proof: Vec<u8>,
    ) -> Result<()> {
        let insurance_nft = &ctx.accounts.insurance_nft;
        let clock = Clock::get()?;
        
        // Verify NFT is valid and not expired
        require!(clock.unix_timestamp < insurance_nft.expiry, ErrorCode::InsuranceExpired);
        require!(claim_amount <= insurance_nft.payout_cap, ErrorCode::ClaimExceedsCap);
        
        // Create claim account
        let claim = &mut ctx.accounts.claim;
        claim.claimant = ctx.accounts.user.key();
        claim.amount = claim_amount;
        claim.timestamp = clock.unix_timestamp;
        claim.status = ClaimStatus::Pending;
        claim.proof = proof;
        claim.insurance_nft = insurance_nft.key();
        
        // Lock the NFT
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.insurance_nft_account.to_account_info(),
                to: ctx.accounts.claim_escrow.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, 1)?;
        
        emit!(ClaimInitiated {
            wallet: ctx.accounts.user.key(),
            claim_id: claim.key(),
            amount: claim_amount,
            timestamp: clock.unix_timestamp,
        });
        
        Ok(())
    }

    // DAO governance vote on claim (v2+)
    pub fn vote_on_claim(
        ctx: Context<VoteOnClaim>,
        claim_id: Pubkey,
        approve: bool,
    ) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        let governance = &ctx.accounts.governance;
        
        // Verify governance authority
        require!(governance.is_authorized(&ctx.accounts.voter.key()), ErrorCode::UnauthorizedGovernance);
        
        // Process vote
        if approve {
            claim.approval_votes += 1;
        } else {
            claim.rejection_votes += 1;
        }
        
        // Check if quorum reached
        if claim.approval_votes >= governance.quorum {
            claim.status = ClaimStatus::Approved;
            process_payout(claim)?;
        } else if claim.rejection_votes >= governance.quorum {
            claim.status = ClaimStatus::Rejected;
            // Return NFT to owner
            return_nft_to_owner(claim)?;
        }
        
        emit!(ClaimVoted {
            claim_id,
            voter: ctx.accounts.voter.key(),
            approve,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// Helper functions
impl IRISAnchor {
    fn verify_iris_signature(message: &ScoreMessage, signature: &[u8; 64]) -> Result<()> {
        // Implementation would verify the signature against IRIS oracle public key
        Ok(())
    }
    
    fn check_protection_triggers(user_account: &mut Account<UserAccount>) -> Result<()> {
        let latest_score = user_account.score_history.last().unwrap().value;
        if latest_score >= user_account.preferences.risk_threshold {
            // Would trigger protection logic based on user preferences
            // This is simplified for the example
            emit!(RiskThresholdBreached {
                wallet: user_account.wallet,
                score: latest_score,
                threshold: user_account.preferences.risk_threshold,
                timestamp: Clock::get()?.unix_timestamp,
            });
        }
        Ok(())
    }
    
    fn process_payout(claim: &mut Account<Claim>) -> Result<()> {
        // Implementation would transfer funds from insurance pool to claimant
        Ok(())
    }
    
    fn return_nft_to_owner(claim: &mut Account<Claim>) -> Result<()> {
        // Implementation would return NFT from escrow to original owner
        Ok(())
    }
}

// Accounts
#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(init, payer = user, space = 8 + UserAccount::LEN)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Subscribe<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub payment_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_account: Account<'info, TokenAccount>,
    pub payment_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateRiskScore<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    pub oracle: Signer<'info>,
}

#[derive(Accounts)]
pub struct MintInsuranceNft<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(init, payer = user, space = 8 + InsuranceNFT::LEN)]
    pub insurance_nft: Account<'info, InsuranceNFT>,
    #[account(mut)]
    pub insurance_nft_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub iris_authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct TriggerProtection<'info> {
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    #[account(init, payer = user, space = 8 + ActionLog::LEN)]
    pub action_log: Account<'info, ActionLog>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitiateClaim<'info> {
    #[account(mut)]
    pub insurance_nft: Account<'info, InsuranceNFT>,
    #[account(mut)]
    pub insurance_nft_account: Account<'info, TokenAccount>,
    #[account(init, payer = user, space = 8 + Claim::LEN)]
    pub claim: Account<'info, Claim>,
    #[account(mut)]
    pub claim_escrow: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnClaim<'info> {
    #[account(mut)]
    pub claim: Account<'info, Claim>,
    pub governance: Account<'info, Governance>,
    pub voter: Signer<'info>,
}

// Structs
#[account]
pub struct UserAccount {
    pub wallet: Pubkey,
    pub preferences: RiskParams,
    pub active_sub: bool,
    pub subscription_expiry: i64,
    pub score_history: Vec<Score>,
}

#[account]
pub struct InsuranceNFT {
    pub tier: u8,
    pub expiry: i64,
    pub payout_cap: u64,
    pub token_mint: Pubkey,
    pub owner: Pubkey,
}

#[account]
pub struct ActionLog {
    pub timestamp: i64,
    pub trigger_type: ProtectionAction,
    pub token: Pubkey,
    pub score: u8,
}

#[account]
pub struct Claim {
    pub claimant: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub status: ClaimStatus,
    pub proof: Vec<u8>,
    pub insurance_nft: Pubkey,
    pub approval_votes: u64,
    pub rejection_votes: u64,
}

#[account]
pub struct Governance {
    pub authority: Pubkey,
    pub quorum: u64,
    pub voting_duration: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct RiskParams {
    pub risk_threshold: u8,
    pub watchlist: Vec<Pubkey>,
    pub auto_swap: bool,
    pub auto_freeze: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Score {
    pub value: u8,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ScoreMessage {
    pub wallet: Pubkey,
    pub score: u8,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ProtectionAction {
    Swap,
    Freeze,
    Alert,
    Claim,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ClaimStatus {
    Pending,
    Approved,
    Rejected,
}

// Implementation of constants and helper methods
impl UserAccount {
    pub const LEN: usize = 32 + RiskParams::LEN + 1 + 8 + (4 + Score::LEN * 10); // Assuming max 10 scores stored
}

impl RiskParams {
    pub const LEN: usize = 1 + (4 + 32 * 10) + 1 + 1; // Assuming max 10 tokens in watchlist
}

impl InsuranceNFT {
    pub const LEN: usize = 1 + 8 + 8 + 32 + 32;
}

impl ActionLog {
    pub const LEN: usize = 8 + 1 + 32 + 1;
}

impl Claim {
    pub const LEN: usize = 32 + 8 + 8 + 1 + (4 + 1024) + 32 + 8 + 8; // Proof limited to 1KB
}

impl Governance {
    pub fn is_authorized(&self, voter: &Pubkey) -> bool {
        // Simplified - would check if voter has governance tokens
        voter == &self.authority
    }
}

impl SubscriptionPlan {
    pub fn get_plan(plan_id: u8) -> Result<Self> {
        match plan_id {
            1 => Ok(SubscriptionPlan {
                id: 1,
                duration: 30 * 24 * 60 * 60, // 30 days
                price: 10 * 10u64.pow(6), // 10 USDC (6 decimals)
            }),
            2 => Ok(SubscriptionPlan {
                id: 2,
                duration: 90 * 24 * 60 * 60, // 90 days
                price: 25 * 10u64.pow(6), // 25 USDC
            }),
            _ => Err(ErrorCode::InvalidPlan.into()),
        }
    }
}

// Events
#[event]
pub struct SubscriptionEvent {
    pub wallet: Pubkey,
    pub plan_id: u8,
    pub expiry: i64,
    pub timestamp: i64,
}

#[event]
pub struct InsuranceNftMinted {
    pub wallet: Pubkey,
    pub mint: Pubkey,
    pub tier: u8,
    pub expiry: i64,
    pub payout_cap: u64,
}

#[event]
pub struct ProtectionTriggered {
    pub wallet: Pubkey,
    pub action: String,
    pub token: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RiskThresholdBreached {
    pub wallet: Pubkey,
    pub score: u8,
    pub threshold: u8,
    pub timestamp: i64,
}

#[event]
pub struct ClaimInitiated {
    pub wallet: Pubkey,
    pub claim_id: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ClaimVoted {
    pub claim_id: Pubkey,
    pub voter: Pubkey,
    pub approve: bool,
    pub timestamp: i64,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient payment for selected plan")]
    InsufficientPayment,
    #[msg("No active subscription")]
    NoActiveSubscription,
    #[msg("Subscription has expired")]
    SubscriptionExpired,
    #[msg("Invalid protection action")]
    InvalidAction,
    #[msg("Insurance NFT has expired")]
    InsuranceExpired,
    #[msg("Claim amount exceeds coverage cap")]
    ClaimExceedsCap,
    #[msg("Unauthorized governance action")]
    UnauthorizedGovernance,
    #[msg("Invalid subscription plan")]
    InvalidPlan,
    #[msg("Invalid oracle signature")]
    InvalidSignature,
}