import { useState, useRef } from 'react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE_MB = 5

export default function useMediaUpload() {
  const [previews, setPreviews] = useState([])   // { url, file } array
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const openPicker = () => {
    setError('')
    fileInputRef.current?.click()
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    setError('')

    if (previews.length + files.length > 4) {
      setError('Maximum 4 images per post')
      return
    }

    const valid = []
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, GIF, WEBP allowed')
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each file must be under ${MAX_SIZE_MB}MB`)
        return
      }
      valid.push({ url: URL.createObjectURL(file), file })
    }

    setPreviews(prev => [...prev, ...valid])
    e.target.value = ''   // reset so same file can be re-selected
  }

  const removeImage = (index) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url)  // free memory
      return prev.filter((_, i) => i !== index)
    })
  }

  const clear = () => {
    previews.forEach(p => URL.revokeObjectURL(p.url))
    setPreviews([])
    setError('')
  }

  return { previews, error, fileInputRef, openPicker, handleFiles, removeImage, clear }
}