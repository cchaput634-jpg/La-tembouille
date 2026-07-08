import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void, intervalMs: number) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const run = () => {
      if (document.visibilityState === 'visible') callbackRef.current()
    }
    const interval = window.setInterval(run, intervalMs)
    document.addEventListener('visibilitychange', run)
    window.addEventListener('focus', run)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', run)
      window.removeEventListener('focus', run)
    }
  }, [intervalMs])
}
