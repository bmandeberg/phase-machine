import { useState, useEffect } from 'react'

export default function useAlt() {
  const [alt, setAlt] = useState(false)

  useEffect(() => {
    function altOn() {
      setAlt(true)
    }
    function altOff() {
      setAlt(false)
    }
    document.addEventListener('altOn', altOn)
    document.addEventListener('altOff', altOff)
    return () => {
      document.removeEventListener('altOn', altOn)
      document.removeEventListener('altOff', altOff)
    }
  }, [])

  return alt
}
