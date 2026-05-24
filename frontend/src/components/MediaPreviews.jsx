import { HiXMark } from 'react-icons/hi2'

export default function MediaPreviews({ previews, onRemove }) {
    if (!previews.length) return null

    const grid = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-2',
        4: 'grid-cols-2',
    }[previews.length] ?? 'grid-cols-2'

    return (
        <div className={`grid ${grid} gap-1.5 mt-3 rounded-xl overflow-hidden`}>
            {previews.map((p, i) => (
                <div
                    key={p.url}
                    className={`relative ${previews.length === 3 && i === 0 ? 'row-span-2' : ''}`}
                >
                    <img
                        src={p.url}
                        alt={`upload-${i}`}
                        className="w-full h-40 object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full 
              bg-black/60 hover:bg-black/80 flex items-center justify-center 
              transition-colors"
                    >
                        <HiXMark className="w-3.5 h-3.5 text-white" />
                    </button>
                </div>
            ))}
        </div>
    )
}