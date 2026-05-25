import { useState } from 'react'
import { HiXMark, HiOutlineClipboardDocument, HiOutlineLockClosed } from 'react-icons/hi2'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { PiCookieLight } from 'react-icons/pi'

/* ── Card content ── */
const CARDS = {
    terms: {
        title: 'Terms of Service',
        emoji: <HiOutlineClipboardDocument />,
        sections: [
            {
                heading: 'Acceptance of Terms',
                body: 'By accessing or using Chatox, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.',
            },
            {
                heading: 'User Responsibilities',
                body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree not to share, sell, or transfer your account to any third party.',
            },
            {
                heading: 'Content Policy',
                body: 'You retain ownership of content you post on Chatox. By posting, you grant Chatox a non-exclusive license to display and distribute your content on the platform. You agree not to post harmful, illegal, or misleading content.',
            },
            {
                heading: 'Termination',
                body: 'Chatox reserves the right to suspend or terminate accounts that violate these terms without prior notice. You may also delete your account at any time through Settings.',
            },
        ],
    },
    privacy: {
        title: 'Privacy Policy',
        emoji: <HiOutlineLockClosed />,
        sections: [
            {
                heading: 'Data We Collect',
                body: 'We collect information you provide directly: username, email address, profile details, and content you post. We also collect usage data such as login timestamps and interaction patterns to improve the platform.',
            },
            {
                heading: 'How We Use Your Data',
                body: 'Your data is used to operate and improve Chatox, personalize your experience, send important account notifications, and ensure platform security. We do not sell your personal data to third parties.',
            },
            {
                heading: 'Data Storage & Security',
                body: 'All data is stored securely using industry-standard encryption. We implement access controls, regular security audits, and follow best practices to protect your information from unauthorized access.',
            },
            {
                heading: 'Your Rights',
                body: 'You have the right to access, correct, or delete your personal data at any time. To exercise these rights, visit your Settings page or contact our support team.',
            },
        ],
    },
    cookies: {
        title: 'Cookie Policy',
        emoji: <PiCookieLight />,
        sections: [
            {
                heading: 'What Are Cookies',
                body: 'Cookies are small text files stored on your device when you visit Chatox. They help us remember your preferences, keep you logged in, and understand how you use our platform.',
            },
            {
                heading: 'Essential Cookies',
                body: 'These cookies are required for Chatox to function properly. They manage your login session and security tokens. You cannot opt out of essential cookies while using the platform.',
            },
            {
                heading: 'Preference Cookies',
                body: 'We use preference cookies to remember your settings such as theme (light/dark mode) and language preferences, so you do not have to reconfigure them each visit.',
            },
            {
                heading: 'Managing Cookies',
                body: 'You can control cookies through your browser settings. Disabling certain cookies may affect platform functionality. We respect Do Not Track signals where technically feasible.',
            },
        ],
    },
}

/* ── Modal ── */
function CardModal({ cardKey, onClose }) {
    const card = CARDS[cardKey]
    if (!card) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal box */}
            <div
                className="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col
          bg-white dark:bg-zinc-900
          border border-gray-200 dark:border-zinc-700
          rounded-2xl shadow-2xl overflow-hidden
          animate-[modalIn_0.2s_ease]"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'modalIn 0.2s ease' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4
          border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">{card.emoji}</span>
                        <h2 className="font-bold text-base text-gray-900 dark:text-zinc-100">
                            {card.title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full
              text-gray-400 dark:text-zinc-500
              hover:bg-gray-100 dark:hover:bg-zinc-800
              hover:text-gray-600 dark:hover:text-zinc-300
              transition-colors"
                    >
                        <HiXMark className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="overflow-y-auto px-5 py-4 flex flex-col gap-5">
                    {card.sections.map((s, i) => (
                        <div key={i}>
                            <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-100 mb-1.5">
                                {s.heading}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                                {s.body}
                            </p>
                        </div>
                    ))}
                    <p className="text-xs text-gray-400 dark:text-zinc-600 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        Last updated: {new Date().toLocaleString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })} · Chatox Corp.
                    </p>
                </div>
            </div>

            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
        </div>
    )
}

/* ── Main FooterCards component ── */
export default function FooterCards() {
    const [open, setOpen] = useState(null)

    return (
        <>
            <footer className="flex flex-col gap-3 px-1 mt-auto">

                {/* Social links */}
                <div className="flex items-center gap-3">
                    <a
                        href="https://www.linkedin.com/in/drishti-rajput-181790316/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 rounded-full
              text-gray-400 dark:text-zinc-500
              hover:text-blue-600 dark:hover:text-blue-400
              hover:bg-blue-50 dark:hover:bg-blue-500/10
              transition-colors"
                        title="LinkedIn"
                    >
                        <FaLinkedin className="w-4 h-4" />
                    </a>
                    <a
                        href="https://github.com/drishtirajput121-a11y"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 rounded-full
              text-gray-400 dark:text-zinc-500
              hover:text-gray-900 dark:hover:text-zinc-100
              hover:bg-gray-100 dark:hover:bg-zinc-800
              transition-colors"
                        title="GitHub"
                    >
                        <FaGithub className="w-4 h-4" />
                    </a>
                </div>

                {/* Policy links */}
                <div className="flex flex-wrap gap-x-2.5 gap-y-1.5">
                    {[
                        { key: 'terms', label: 'Terms' },
                        { key: 'privacy', label: 'Privacy' },
                        { key: 'cookies', label: 'Cookies' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setOpen(key)}
                            className="text-xs text-gray-400 dark:text-zinc-500
                hover:text-gray-700 dark:hover:text-zinc-300
                hover:underline transition-colors"
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-400 dark:text-zinc-600">
                    © 2026 Chatox Corp.
                </p>
            </footer>

            {/* Modal */}
            {open && <CardModal cardKey={open} onClose={() => setOpen(null)} />}
        </>
    )
}