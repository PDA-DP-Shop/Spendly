/**
 * Spendly Multi-Engine Fast Scanner
 * Combines qr-scanner (best for iOS) and zbar-wasm (best for tilted barcodes)
 * Built for instant detection at any angle.
 */

import QrScanner from 'qr-scanner'
import { scanImageData } from '@undecaf/zbar-wasm'

// Tell qr-scanner where to find its worker
// Important: Ensure you copy qr-scanner-worker.min.js to public/
QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'

/**
 * Enhanced Constraints for Fast Auto-Focus & Low Light
 */
export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'environment',
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 },
    focusMode: 'continuous',
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous',
    zoom: 1.0
  }
}

/**
 * Engine 1: QrScanner (Best for iPhone/iPad Safari)
 */
const scanWithQrScanner = async (video) => {
  try {
    const result = await QrScanner.scanImage(video, {
      returnDetailedScanResult: true,
      alsoTryWithoutScanRegion: true
    })
    return {
      text: result.data,
      format: 'QR_CODE',
      engine: 'qr-scanner'
    }
  } catch {
    return null
  }
}

/**
 * Engine 2: ZBar WASM (Best for tilted/damaged barcodes)
 */
const scanWithZbar = async (video) => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const results = await scanImageData(imageData)
    
    if (results.length > 0) {
      return {
        text: results[0].decode(),
        format: results[0].typeName,
        engine: 'zbar'
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Image Preprocessing for Low Light / Low Contrast
 */
const preprocessCanvas = (video) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // Use slightly smaller size for faster rotation processing if needed
  canvas.width = 640
  canvas.height = 480
  
  ctx.drawImage(video, 0, 0, 640, 480)
  
  // High contrast & Slight Brightness for dark shops
  ctx.filter = 'contrast(1.4) brightness(1.1)'
  ctx.drawImage(canvas, 0, 0)
  
  return canvas
}

/**
 * Rotation Fallback for 45-degree tilted codes
 */
const rotateCanvas = (canvas, degrees) => {
  const rotated = document.createElement('canvas')
  if (degrees === 90 || degrees === 270) {
    rotated.width = canvas.height
    rotated.height = canvas.width
  } else {
    rotated.width = canvas.width
    rotated.height = canvas.height
  }
  
  const ctx = rotated.getContext('2d')
  ctx.translate(rotated.width / 2, rotated.height / 2)
  ctx.rotate((degrees * Math.PI) / 180)
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
  
  return rotated
}

/**
 * Main Parallel Scan Frame
 */
const scanFrame = async (video) => {
  // Parallel execution for maximum speed
  const [qrResult, zbarResult] = await Promise.allSettled([
    scanWithQrScanner(video),
    scanWithZbar(video)
  ])

  if (qrResult.status === 'fulfilled' && qrResult.value) return qrResult.value
  if (zbarResult.status === 'fulfilled' && zbarResult.value) return zbarResult.value

  return null
}

/**
 * High Speed Scan Loop
 */
export const startScanLoop = (videoElement, onResult, onStatusChange) => {
  let isScanning = true
  let lastScanTime = 0
  let failedAttempts = 0
  const SCAN_INTERVAL = 100 // every 100ms

  const scanLoop = async (timestamp) => {
    if (!isScanning) return

    if (timestamp - lastScanTime >= SCAN_INTERVAL) {
      lastScanTime = timestamp
      
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        
        let result = await scanFrame(videoElement)
        
        // Multi-Angle Logic: if failed 10 times, try rotations
        if (!result && failedAttempts > 10) {
          onStatusChange?.('Trying different angles...')
          const preprocessed = preprocessCanvas(videoElement)
          const rotations = [90, 180, 270]
          
          for (const angle of rotations) {
            const rotated = rotateCanvas(preprocessed, angle)
            result = await scanWithZbar(rotated) // ZBar is better at rotated images
            if (result) break
          }
        }

        if (result) {
          isScanning = false
          playBeep()
          if (navigator.vibrate) navigator.vibrate(60)
          onResult(result)
          return
        } else {
          failedAttempts++
          onStatusChange?.('Scanning...')
          
          // Auto-Zoom: if failed 30 times, try zooming in
          if (failedAttempts === 30) {
             tryZoom(videoElement.srcObject.getVideoTracks()[0], true)
          }
        }
      }
    }

    requestAnimationFrame(scanLoop)
  }

  requestAnimationFrame(scanLoop)
  return () => { isScanning = false }
}

/**
 * Success Haptics & Audio
 */
export const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.frequency.value = 1800
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  } catch (e) {}
}

/**
 * Torch Feature
 */
export const checkTorchSupport = async (stream) => {
  try {
    const track = stream.getVideoTracks()[0]
    const capabilities = track.getCapabilities()
    return capabilities.torch === true
  } catch {
    return false
  }
}

export const toggleTorch = async (videoElement, on) => {
  try {
    const track = videoElement.srcObject.getVideoTracks()[0]
    await track.applyConstraints({
      advanced: [{ torch: on }]
    })
    return true
  } catch {
    return false
  }
}

/**
 * Auto-Zoom Feature
 */
export const tryZoom = async (videoTrack, zoomIn) => {
  try {
    const capabilities = videoTrack.getCapabilities()
    if (capabilities.zoom) {
      const settings = videoTrack.getSettings()
      const currentZoom = settings.zoom || 1.0
      const newZoom = zoomIn ? Math.min(currentZoom + 0.5, 2.0) : 1.0
      
      await videoTrack.applyConstraints({
        advanced: [{ zoom: newZoom }]
      })
    }
  } catch {}
}
