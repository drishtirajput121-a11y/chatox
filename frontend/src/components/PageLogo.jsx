import { useNavigate } from 'react-router-dom'
import { HiHome } from 'react-icons/hi2'

export default function PageLogo() {
    const navigate = useNavigate()
    return (
        <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-10 h-10 rounded-full
                hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            title="Go to Home"
        >
            <HiHome className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
    )
}