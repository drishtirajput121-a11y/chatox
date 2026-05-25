import { useNavigate } from 'react-router-dom'
import { FaReact } from 'react-icons/fa'

export default function PageLogo() {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            title="Go to Home"
        >
            <FaReact className="text-2xl text-blue-500 animate-spin [animation-duration:20s]" />
            <span className="text-base font-extrabold tracking-tight
        text-gray-900 dark:text-white hidden sm:inline">
                Chatox
            </span>
        </button>
    )
}