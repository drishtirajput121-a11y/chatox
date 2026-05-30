import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyOTP } from '../api/auth'
import { useAuthStore } from '../context/authStore'
import { HiMail } from 'react-icons/hi'

export default function OTPPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const { login } = useAuthStore()

    const email = location.state?.email
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [resending, setResending] = useState(false)
    const [countdown, setCountdown] = useState(60)
    const inputs = useRef([])

    // redirect if no email in state
    useEffect(() => {
        if (!email) navigate('/register')
    }, [email])

    // countdown timer for resend
    useEffect(() => {
        if (countdown === 0) return
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown])

    const handleChange = (i, val) => {
        if (!/^\d?$/.test(val)) return  // only digits
        const next = [...otp]
        next[i] = val
        setOtp(next)
        // auto-focus next
        if (val && i < 5) inputs.current[i + 1]?.focus()
    }

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) {
            inputs.current[i - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setOtp(pasted.split(''))
            inputs.current[5]?.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const code = otp.join('')
        if (code.length !== 6) { setError('Enter the 6-digit code'); return }
        setLoading(true)
        setError('')
        try {
            const { data } = await verifyOTP(email, code)
            // store tokens + user — same as login
            localStorage.setItem('access_token', data.access)
            localStorage.setItem('refresh_token', data.refresh)
            await useAuthStore.getState().setUserFromTokens()
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code')
            setOtp(['', '', '', '', '', ''])
            inputs.current[0]?.focus()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center
            bg-gray-50 dark:bg-gray-950 px-4 py-8">
            <div className="w-full max-w-md bg-white dark:bg-black
                border border-gray-200 dark:border-gray-800
                rounded-2xl px-8 py-10
                shadow-[0_8px_24px_rgba(0,0,0,0.08)]">

                {/* Logo */}
                <div className="flex items-center gap-3 text-blue-500
                    text-2xl font-extrabold tracking-tight mb-8">
                    <img src="/chatox.png" alt="Chatox" className="w-10 h-10" />
                    <span>Chatox</span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20
                    rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-3xl"><HiMail /></span>
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight
                    text-gray-900 dark:text-white mb-2">
                    Check your email
                </h1>
                <p className="text-sm text-gray-500 mb-1">
                    We sent a 6-digit code to
                </p>
                <p className="text-sm font-semibold text-blue-500 mb-8">
                    {email}
                </p>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-500
                        border border-red-200 dark:border-red-800
                        rounded-xl px-4 py-3 text-sm font-medium mb-5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* OTP inputs */}
                    <div className="flex gap-3 justify-center mb-8"
                        onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => inputs.current[i] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                autoFocus={i === 0}
                                className="w-12 h-14 text-center text-xl font-bold
                                    border-2 border-gray-200 dark:border-gray-700
                                    rounded-xl bg-white dark:bg-gray-900
                                    text-gray-900 dark:text-white outline-none
                                    transition-all focus:border-blue-500
                                    focus:ring-2 focus:ring-blue-500/20"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full flex items-center justify-center gap-2
                            bg-blue-500 hover:bg-blue-600 text-white font-bold
                            text-sm py-3 rounded-full
                            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading && (
                            <span className="w-4 h-4 border-2 border-white/30
                                border-t-white rounded-full animate-spin" />
                        )}
                        {loading ? 'Verifying…' : 'Verify & create account'}
                    </button>
                </form>

                {/* Resend */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Didn't receive it?{' '}
                    {countdown > 0 ? (
                        <span className="text-gray-400">Resend in {countdown}s</span>
                    ) : (
                        <button
                            onClick={async () => {
                                setResending(true)
                                try {
                                    // user needs to go back and re-enter details
                                    navigate('/register')
                                } finally {
                                    setResending(false)
                                }
                            }}
                            className="text-blue-500 font-bold hover:underline"
                        >
                            {resending ? 'Sending…' : 'Go back & resend'}
                        </button>
                    )}
                </p>

                <button
                    onClick={() => navigate('/register')}
                    className="w-full mt-3 text-sm text-gray-400
                        hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    ← Back to registration
                </button>
            </div>
        </div>
    )
}