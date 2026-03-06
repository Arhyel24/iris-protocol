'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MailOpen, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { WalletButton } from '../solana/solana-provider'

import { useWalletUi } from '@wallet-ui/react'
import shortenWallet from '../../../actions/trim-address'

export const WaitlistForm = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null)

  const { account } = useWalletUi()

  // When a wallet connects, check if it's already on the waitlist
  useEffect(() => {
    if (!account?.address) {
      setAlreadyRegistered(false)
      setMaskedEmail(null)
      return
    }

    let cancelled = false
    setChecking(true)
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    fetch(`${apiBase}/api/v1/waitlist/check/${account.address}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.registered) {
          setAlreadyRegistered(true)
          setMaskedEmail(data.email_masked ?? null)
        } else {
          setAlreadyRegistered(false)
          setMaskedEmail(null)
        }
      })
      .catch(() => {
        /* silently ignore — don't block the form */
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [account?.address])

  if (!account) {
    return (
      <div className="w-full flex items-center justify-center">
        <WalletButton />
      </div>
    )
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center gap-3 text-white/40 font-mono text-xs uppercase tracking-widest py-6">
        <Loader2 size={14} className="animate-spin" />
        Verifying wallet...
      </div>
    )
  }

  if (alreadyRegistered) {
    return (
      <div className="flex flex-col items-center bg-black border border-[#00FFA3]/40 p-8 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[4px] h-full bg-[#00FFA3]" />
        <CheckCircle className="h-10 w-10 text-[#00FFA3] mb-4" strokeWidth={1} />
        <p className="text-[#00FFA3] font-mono text-xl font-bold text-center mb-2 uppercase tracking-widest">
          [ Already Registered ]
        </p>
        <p className="text-sm text-white/50 text-center font-mono mb-3">This wallet is on the waitlist.</p>
        {maskedEmail && (
          <p className="text-xs text-white/30 font-mono uppercase tracking-widest border border-white/10 px-4 py-2">
            {maskedEmail}
          </p>
        )}
        <p className="text-xs text-white/30 font-mono uppercase tracking-widest mt-4">
          [ {shortenWallet(account.address)} ]
        </p>
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

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
      const response = await fetch(`${apiBase}/api/v1/waitlist/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, wallet: account.address }),
      })

      if (response.status === 409) {
        const data = await response.json()
        const msg: string = data?.detail ?? 'Already on the waitlist.'
        setError(msg)
        setStatus('idle')
        toast.error(msg)
        return
      }

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      setStatus('success')
      setEmail('')
      toast.success("You've been added to the waitlist!")
    } catch (err) {
      console.error('Waitlist submission error:', err)
      setError('Something went wrong. Please try again later.')
      setStatus('error')
      toast.error('Failed to join waitlist. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center bg-black border border-[#00FFA3] p-8 max-w-md mx-auto relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-[4px] h-full bg-[#00FFA3]" />
        <MailOpen
          className="h-10 w-10 text-[#00FFA3] mb-4 group-hover:scale-110 transition-transform"
          strokeWidth={1}
        />
        <p className="text-[#00FFA3] font-mono text-xl font-bold text-center mb-2 uppercase tracking-widest">
          [ SUCCESS ]
        </p>
        <p className="text-sm text-white/60 text-center font-mono uppercase">
          Your signal has been received.
          <br />
          Stand by for Alpha access.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="m-3 font-mono text-xs text-white/50 uppercase tracking-widest">
        [ Connected: {shortenWallet(account.address)} ]
      </p>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-0 items-stretch max-w-xl mx-auto w-full relative mb-12 shadow-[0_0_30px_rgba(0,255,163,0.1)] focus-within:shadow-[0_0_30px_rgba(0,255,163,0.2)] transition-shadow duration-300"
        aria-label="Join the waitlist for IRIS"
      >
        <div className="relative w-full flex-1 group">
          <Input
            type="email"
            placeholder="_ENTER_EMAIL_ADDR"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="h-full w-full bg-black border-2 border-r-0 border-white/20 text-lg font-mono text-white placeholder:text-white/30 rounded-none focus:border-[#00FFA3] focus:ring-0 px-6 py-4"
            autoComplete="email"
            disabled={status === 'loading'}
          />
          {error && (
            <span className="absolute text-red-500 font-mono text-xs mt-2 w-full left-0 uppercase tracking-wider">
              {error}
            </span>
          )}
        </div>

        <Button
          type="submit"
          className="bg-[#00FFA3] hover:bg-white text-black font-bold font-mono text-lg px-8 py-4 border-2 border-[#00FFA3] hover:border-white rounded-none uppercase tracking-widest transition-all h-auto"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'TRANSMITTING...' : 'INITIALIZE'}
        </Button>
      </form>
    </>
  )
}
