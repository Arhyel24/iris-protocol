'use client'

import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MailOpen } from 'lucide-react'
import { toast } from 'sonner'

import { WalletButton } from '../solana/solana-provider'

import { useWalletUi } from '@wallet-ui/react'
import shortenWallet from '../../../actions/trim-address'

export const WaitlistForm = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const { account } = useWalletUi()

  if (!account) {
    return (
      <div className="w-full flex items-center justify-center">
        <WalletButton />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      setStatus('idle')
      return
    }

    const { data: existingEmail, error: checkError } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single()

    if (checkError) {
      console.log('Supabase check error:', checkError)

      if (checkError.code !== 'PGRST116') {
        // "PGRST116" indicates no rows found, which is fine
        console.error('Supabase check error:', checkError)
        setError('Something went wrong. Please try again later.')
        setStatus('error')
        return
      }
    }

    if (existingEmail) {
      setStatus('idle')
      setError('This email is already on the waitlist.')
      toast.info("You're already on the waitlist.")
      return
    }

    const { error: supabaseError } = await supabase.from('waitlist').insert({ email })

    if (!supabaseError) {
      setStatus('success')
      setEmail('')
      toast.success("You've been added to the waitlist!")
    } else {
      console.error('Supabase error:', supabaseError)
      setError('Something went wrong. Please try again later.')
      setStatus('error')
      toast.error('Failed to join waitlist. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center">
        <MailOpen className="h-8 w-8 text-[#8B5CF6] mb-2" />
        <p className="text-green-400 font-semibold text-center mb-2">You&apos;re on the waitlist!</p>
        <p className="text-sm text-white/60 text-center">We&apos;ll email you when IRIS launches.</p>
      </div>
    )
  }

  return (
    <>
      <p className="m-3">connected to {shortenWallet(account.address)}</p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-3 items-center max-w-lg mx-auto w-full relative"
        aria-label="Join the waitlist for IRIS"
      >
        <div className="relative w-full">
          <Input
            type="email"
            placeholder="you@email.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-[#1E2330] border border-white/20 text-base text-white focus:ring-[#8B5CF6]"
            autoComplete="email"
            disabled={status === 'loading'}
          />
          {/* Error message positioning */}
          {error && <span className="absolute text-red-400 text-sm mt-1 w-full left-0">{error}</span>}
        </div>

        <Button
          type="submit"
          className="bg-[#8B5CF6] hover:bg-[#8B5CF6]/80 text-white font-inter text-lg px-6 py-3 rounded-lg shadow-lg w-full md:w-fit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Signing up...' : 'Sign up'}
        </Button>
      </form>
    </>
  )
}
