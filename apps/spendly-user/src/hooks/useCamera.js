/**
 * useCamera Hook - High-Quality Sensor Integration
 * Manages navigator.mediaDevices.getUserMedia with 4K support and Auto-Focus
 */
import { useState, useCallback, useRef, useEffect } from 'react'

export function useCamera() {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [torch, setTorch] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setStream(null)
    setIsReady(false)
    setTorch(false)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      // 1. Request Sensor with Robust Resolution Ladder
      // Trying 1080p then falling back to standard 720p for older mobile chips
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { min: 640, ideal: 1920, max: 3840 },
          height: { min: 480, ideal: 1080, max: 2160 },
          frameRate: { ideal: 30 }
        }
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = newStream
      setStream(newStream)
      
      // 2. Enable Advanced Features (Continuous Focus) if supported
      const track = newStream.getVideoTracks()[0]
      if (track) {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {}
        
        const advancedConstraints = {}
        if (capabilities.focusMode?.includes('continuous')) {
          advancedConstraints.focusMode = 'continuous'
        }
        
        if (Object.keys(advancedConstraints).length > 0) {
          try {
            await track.applyConstraints({ advanced: [advancedConstraints] })
          } catch (e) {
            console.warn("Sensor constraints application partial", e)
          }
        }
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        // Ensure playback starts
        try { await videoRef.current.play() } catch(e) {}
        setIsReady(true)
      }
      
      return newStream
    } catch (err) {
      setError(err)
      console.error("Camera sensor failure", err)
      return null
    }
  }, [])

  const toggleTorch = useCallback(async () => {
    const activeStream = streamRef.current || stream
    if (!activeStream) return
    
    try {
      const track = activeStream.getVideoTracks()[0]
      const capabilities = track.getCapabilities()
      
      if (capabilities.torch) {
        await track.applyConstraints({
           advanced: [{ torch: !torch }]
        })
        setTorch(!torch)
      }
    } catch (e) {
      console.warn("Torch toggle failed", e)
    }
  }, [stream, torch])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    videoRef,
    stream,
    error,
    torch,
    isReady,
    setIsReady,
    startCamera,
    stopCamera,
    toggleTorch
  }
}
