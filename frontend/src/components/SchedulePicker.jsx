import { HiXMark, HiCalendarDays } from 'react-icons/hi2'

export default function SchedulePicker({ value, onChange, onRemove }) {
    // min = 5 minutes from now
    const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
        .toISOString().slice(0, 16)

    // max = 1 year from now
    const maxDateTime = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString().slice(0, 16)

    return (
        <div className="mt-3 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2 text-white">
                    <HiCalendarDays className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Schedule post</span>
                </div>
                <button
                    type="button"
                    onClick={onRemove}
                    className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 
            flex items-center justify-center transition-colors"
                >
                    <HiXMark className="w-3.5 h-3.5 text-white" />
                </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
                <input
                    type="datetime-local"
                    value={value}
                    min={minDateTime}
                    max={maxDateTime}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-transparent border border-gray-600 rounded-xl
            px-4 py-2.5 text-sm text-white
            focus:outline-none focus:border-blue-500 transition-colors
            [color-scheme:dark]"
                />

                {value && (
                    <p className="text-xs text-blue-400 flex items-center gap-1.5">
                        <HiCalendarDays className="w-3.5 h-3.5" />
                        Will post on {new Date(value).toLocaleString('en-US', {
                            weekday: 'short', month: 'short', day: 'numeric',
                            hour: 'numeric', minute: '2-digit'
                        })}
                    </p>
                )}
            </div>
        </div>
    )
}