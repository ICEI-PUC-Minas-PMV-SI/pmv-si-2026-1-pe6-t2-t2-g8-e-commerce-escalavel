// src/components/Toast.tsx
import { useEffect } from 'react'

export type ToastType = 'success' | 'error'

export interface ToastData {
  message: string
  type: ToastType
}

interface Props {
  toast: ToastData | null
  onClose: () => void
}

export default function Toast({ toast, onClose }: Props) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  )
}
