import { useState } from 'react'
import { tweetsAPI } from '../api/client'

export default function PollDisplay({ poll: initialPoll }) {
    const [poll, setPoll] = useState(initialPoll)
    const [loading, setLoading] = useState(false)

    const showResults = poll.user_voted || poll.is_expired

    const handleVote = async (optionId) => {
        if (poll.is_expired || loading) return
        setLoading(true)

        setPoll(prev => {
            const options = prev.options.map(opt => ({
                ...opt,
                has_voted: opt.id === optionId,
                vote_count: opt.id === optionId
                    ? opt.vote_count + 1
                    : prev.options.find(o => o.has_voted)?.id === opt.id
                        ? opt.vote_count - 1
                        : opt.vote_count,
            }))
            const newTotal = options.reduce((sum, o) => sum + o.vote_count, 0)
            return {
                ...prev,
                user_voted: true,
                total_votes: newTotal,
                options: options.map(o => ({
                    ...o,
                    vote_percent: newTotal ? Math.round((o.vote_count / newTotal) * 100) : 0,
                })),
            }
        })

        try {
            const { data } = await tweetsAPI.votePoll(optionId)
            setPoll(data)
        } catch {
            setPoll(initialPoll)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="mt-3 flex flex-col gap-2"
            onClick={e => e.stopPropagation()}
        >
            {poll.options.map(opt => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleVote(opt.id)}
                    disabled={poll.is_expired || loading}
                    className={`relative w-full text-left rounded-full overflow-hidden
                        border transition-all duration-200 disabled:cursor-default
                        ${opt.has_voted
                            ? 'border-blue-500'
                            : 'border-gray-600 hover:border-blue-400'
                        }`}
                >
                    {showResults && (
                        <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500
                                ${opt.has_voted ? 'bg-blue-500/30' : 'bg-gray-700/40'}`}
                            style={{ width: `${opt.vote_percent}%` }}
                        />
                    )}

                    <div className="relative flex items-center justify-between px-4 py-2.5">
                        <span className={`text-sm ${opt.has_voted ? 'font-medium text-white' : 'text-gray-300'}`}>
                            {opt.text}
                        </span>

                        {showResults && (
                            <span className={`text-sm font-medium ml-2 flex-shrink-0
                                ${opt.has_voted ? 'text-blue-400' : 'text-gray-400'}`}>
                                {opt.vote_percent}%
                            </span>
                        )}
                    </div>
                </button>
            ))}

            <p className="text-xs text-gray-500 px-1 mt-1">
                {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''} ·{' '}
                {poll.is_expired ? 'Final results' : 'Click to change vote'}
            </p>
        </div>
    )
}