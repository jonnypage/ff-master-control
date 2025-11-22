import { useState, useCallback } from 'react';

interface NFCReadResult {
  success: boolean;
  nfcId?: string;
  error?: string;
}

export function useNFCReader() {
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if NFC is supported
  const checkSupport = useCallback(() => {
    if ('NDEFReader' in window) {
      setIsSupported(true);
      return true;
    }
    setIsSupported(false);
    setError('NFC is not supported on this device');
    return false;
  }, []);

  // Read NFC card
  const readNFC = useCallback(async (): Promise<NFCReadResult> => {
    if (!checkSupport()) {
      return { success: false, error: 'NFC not supported' };
    }

    setIsReading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reader = new (window as any).NDEFReader();

      await reader.scan();

      return new Promise((resolve) => {
        let resolved = false;
        const resolveOnce = (result: NFCReadResult) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeoutId);
          setIsReading(false);
          // Try to abort the reader to stop listening
          try {
            reader.abort?.();
          } catch (_e) {
            // Ignore abort errors
          }
          resolve(result);
        };

        const timeoutId = setTimeout(() => {
          resolveOnce({ success: false, error: 'NFC read timeout' });
        }, 10000);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reader.addEventListener('reading', (event: any) => {
          setIsReading(false);

          // Log the full event for debugging
          console.log('[useNFCReader] NFC reading event:', {
            serialNumber: event.serialNumber,
            message: event.message,
            records: event.message?.records,
            fullEvent: event,
          });

          // The serialNumber is the NFC tag's UID (unique identifier)
          // It's available directly on the event object
          let nfcId: string | undefined;

          // Primary: Use serialNumber (UID) - this is the tag's unique ID
          if (event.serialNumber !== undefined && event.serialNumber !== null) {
            // Handle different serialNumber formats
            if (typeof event.serialNumber === 'string') {
              nfcId = event.serialNumber.trim();
            } else if (typeof event.serialNumber === 'number') {
              // Convert number to hex string
              nfcId = event.serialNumber.toString(16).toUpperCase();
            } else if (Array.isArray(event.serialNumber)) {
              // If it's an array of bytes, convert to hex string
              const bytes = Array.from(event.serialNumber) as number[];
              nfcId = bytes
                .map((b) => {
                  const byte =
                    typeof b === 'number' ? b : parseInt(String(b), 10);
                  return byte.toString(16).padStart(2, '0');
                })
                .join('')
                .toUpperCase();
            } else if (
              event.serialNumber instanceof Uint8Array ||
              event.serialNumber instanceof ArrayBuffer ||
              event.serialNumber.buffer instanceof ArrayBuffer
            ) {
              // Handle typed arrays
              const bytes =
                event.serialNumber instanceof ArrayBuffer
                  ? new Uint8Array(event.serialNumber)
                  : new Uint8Array(
                      event.serialNumber.buffer || event.serialNumber,
                    );
              nfcId = Array.from(bytes)
                .map((b: number) => b.toString(16).padStart(2, '0'))
                .join('')
                .toUpperCase();
            } else {
              // Fallback: try to convert to string
              nfcId = String(event.serialNumber).trim();
            }
          }
          // Fallback: Try to read from NDEF record if available
          else if (event.message?.records?.[0]) {
            const record = event.message.records[0];
            if (record.data) {
              try {
                // Decode the data if it's a DataView
                const decoder = new TextDecoder();
                nfcId = decoder.decode(record.data);
              } catch (e) {
                console.error('Failed to decode NDEF record:', e);
              }
            }
          }

          if (!nfcId || nfcId.trim() === '') {
            // Log for debugging
            console.error('Could not extract NFC ID. Event details:', {
              hasSerialNumber: event.serialNumber !== undefined,
              serialNumberType: typeof event.serialNumber,
              serialNumberValue: event.serialNumber,
              hasMessage: !!event.message,
              hasRecords: !!event.message?.records?.length,
            });
            resolveOnce({
              success: false,
              error:
                'Could not extract NFC ID from tag. Serial number: ' +
                (event.serialNumber || 'not available'),
            });
            return;
          }

          // Ensure it's a string and trim whitespace
          nfcId = String(nfcId).trim();

          console.log('[useNFCReader] Extracted NFC ID:', nfcId);
          resolveOnce({ success: true, nfcId });
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reader.addEventListener('readingerror', (event: any) => {
          const errorMsg = event.message || 'Failed to read NFC card';
          setError(errorMsg);
          resolveOnce({ success: false, error: errorMsg });
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reader.addEventListener('error', (event: any) => {
          const errorMsg = event.message || 'Failed to read NFC card';
          setError(errorMsg);
          resolveOnce({ success: false, error: errorMsg });
        });
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setIsReading(false);
      const errorMessage = err.message || 'Failed to read NFC card';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [checkSupport]);

  return {
    isSupported,
    isReading,
    error,
    readNFC,
    checkSupport,
  };
}
