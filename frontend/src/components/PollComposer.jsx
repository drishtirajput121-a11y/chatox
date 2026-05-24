import { HiXMark, HiPlus } from 'react-icons/hi2'

const DURATIONS = [
    { label: '1 day', hours: 24 },
    { label: '3 days', hours: 72 },
    { label: '7 days', hours: 168 },
]

export default function PollComposer({ poll, onChange, onRemove }) {

    const addOption = () => {
        if (poll.options.length >= 4) return
        onChange({ ...poll, options: [...poll.options, ''] })
    }

    const removeOption = (i) => {
        if (poll.options.length <= 2) return
        onChange({ ...poll, options: poll.options.filter((_, idx) => idx !== i) })
    }

    const updateOption = (i, val) => {
        const opts = [...poll.options]
        opts[i] = val
        onChange({ ...poll, options: opts })
    }

    return (
        <div className="mt-3 border border-gray-700 rounded-2xl overflow-hidden">

            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <span className="text-sm font-medium text-white">Poll</span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 
            flex items-center justify-center transition-colors"
                >
                    <HiXMark className="w-3.5 h-3.5 text-white" />
                </button>
            </div>

            {/* options — just text inputs, nothing else */}
            <div className="p-3 flex flex-col gap-2">
                {poll.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={opt}
                            onChange={e => updateOption(i, e.target.value)}
                            placeholder={i < 2 ? `Choice ${i + 1}` : `Choice ${i + 1} (optional)`}
                            maxLength={25}
                            className="flex-1 bg-transparent border border-gray-600 rounded-full
                px-4 py-2 text-sm text-white placeholder-gray-500
                focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <span className="text-xs text-gray-500 w-6 text-right">
                            {25 - opt.length}
                        </span>
                        {i >= 2 && (
                            <button
                                type="button"
                                onClick={() => removeOption(i)}
                                className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <HiXMark className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}

                {poll.options.length < 4 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="flex items-center gap-2 text-blue-400 text-sm
              hover:text-blue-300 transition-colors px-2 py-1"
                    >
                        <HiPlus className="w-4 h-4" />
                        Add choice
                    </button>
                )}
            </div>

            {/* duration */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-700">
                <span className="text-sm text-gray-400">Duration</span>
                <div className="flex gap-2">
                    {DURATIONS.map(d => (
                        <button
                            key={d.hours}
                            type="button"
                            onClick={() => onChange({ ...poll, duration_hours: d.hours })}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${poll.duration_hours === d.hours
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    )
}