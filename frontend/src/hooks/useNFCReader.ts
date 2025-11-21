import { useState, useCallback } from 'react'

interface NFCReadResult {
  success: boolean
  nfcId?: string
  error?: string
}

export function useNFCReader() {
  const [isSupported, setIsSupported] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if NFC is supported
  const checkSupport = useCallback(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true)
      return true
    }
    setIsSupported(false)
    setError('NFC is not supported on this device')
    return false
  }, [])

  // Read NFC card
  const readNFC = useCallback(async (): Promise<NFCReadResult> => {
    if (!checkSupport()) {
      return { success: false, error: 'NFC not supported' }
    }

    setIsReading(true)
    setError(null)

    try {
      const reader = new (window as any).NDEFReader()
      
      await reader.scan()
      
      return new Promise((resolve) => {
        reader.addEventListener('reading', (event: any) => {
          const nfcId = event.serialNumber || event.message?.records?.[0]?.data
          setIsReading(false)
          resolve({ success: true, nfcId })
        })

        reader.addEventListener('error', (event: any) => {
          setIsReading(false)
          setError(event.message || 'Failed to read NFC card')
          resolve({ success: false, error: event.message || 'Failed to read NFC card' })
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          setIsReading(false)
          resolve({ success: false, error: 'NFC read timeout' })
        }, 10000)
      })
    } catch (err: any) {
      setIsReading(false)
      const errorMessage = err.message || 'Failed to read NFC card'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [checkSupport])

  return {
    isSupported,
    isReading,
    error,
    readNFC,
    checkSupport,
  }
}

