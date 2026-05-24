import { useState, useEffect, useRef } from 'react'
import { HiXMark, HiMapPin } from 'react-icons/hi2'

export default function LocationPicker({ value, onChange, onRemove }) {
    const [query, setQuery] = useState(value || '')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef(null)

    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([])
            return
        }
        // debounce — don't fire on every keystroke
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(async () => {
            setLoading(true)
            try {
                // free, no API key needed
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                )
                const data = await res.json()
                setSuggestions(data.map(p => ({
                    id: p.place_id,
                    name: p.display_name.split(',').slice(0, 2).join(',').trim(),
                    full: p.display_name,
                })))
            } catch {
                setSuggestions([])
            } finally {
                setLoading(false)
            }
        }, 400)
    }, [query])

    const select = (place) => {
        setQuery(place.name)
        onChange(place.name)
        setSuggestions([])
    }

    return (
        <div className="mt-3 border border-gray-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <HiMapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Location</span>
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

            <div className="p-3 relative">
                <div className="relative">
                    <HiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 
            w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value)
                            if (!e.target.value) onChange('')
                        }}
                        placeholder="Search city or place..."
                        className="w-full bg-transparent border border-gray-600 rounded-full
              pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500
              focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 
              w-3.5 h-3.5 border border-gray-500 border-t-blue-400 
              rounded-full animate-spin" />
                    )}
                </div>

                {/* suggestions dropdown */}
                {suggestions.length > 0 && (
                    <div className="mt-1 border border-gray-700 rounded-xl overflow-hidden">
                        {suggestions.map(s => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => select(s)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-left
                  hover:bg-gray-800 transition-colors border-b border-gray-700/50
                  last:border-b-0"
                            >
                                <HiMapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-200 truncate">{s.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* selected location tag */}
                {value && !suggestions.length && (
                    <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 
            bg-blue-500/10 border border-blue-500/30 rounded-full w-fit">
                        <HiMapPin className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400">{value}</span>
                    </div>
                )}
            </div>
        </div>
    )
}