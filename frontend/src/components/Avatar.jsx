export default function Avatar({ username, src, size = 40 }) {
    const palettes = [
        ['bg-blue-100 text-blue-600'],
        ['bg-green-100 text-green-600'],
        ['bg-pink-100 text-pink-600'],
        ['bg-purple-100 text-purple-600'],
        ['bg-amber-100 text-amber-600'],
        ['bg-teal-100 text-teal-600'],
    ]
    const idx = username ? username.charCodeAt(0) % palettes.length : 0
    const cls = palettes[idx][0]

    if (src) return (
        <img
            src={src}
            alt={username}
            className="rounded-full object-cover flex-shrink-0"
            style={{ width: size, height: size }}
        />
    )

    return (
        <div
            className={`rounded-full flex items-center justify-center
        font-bold flex-shrink-0 ${cls}`}
            style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
            {username ? username[0].toUpperCase() : '?'}
        </div>
    )
}