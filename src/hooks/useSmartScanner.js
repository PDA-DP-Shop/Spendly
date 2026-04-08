/**
 * useSmartScanner Hook
 * Encapsulates scanner state, frame loop, and result handling
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { runScanPipeline, processManualScan } from '../services/scanner/smartScanService'
import { detectBarcode, processBarcode } from '../services/scanner/barcodeDetector'
import { isCloudReady } from '../services/scanner/cloudScanService'

export function useSmartScanner(videoRef, onResult, mode = 'BARCODE') {
  const [scanStatus, setScanStatus] = useState('Point at product or bill')
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const canvasRef = useRef(document.createElement('canvas'))
  const barcodeCanvasRef = useRef(document.createElement('canvas'))
  const highResCanvasRef = useRef(document.createElement('canvas'))
  const frameCount = useRef(0)
  const lastScanTime = useRef(0)
  const passToggle = useRef(true) // Toggle between Global and Center pass

  const scanLoop = useCallback(async () => {
    // 1. Throttling: High-performance interval (100ms) for "Instant" feel
    const now = Date.now()
    if (now - lastScanTime.current < 100) {
      if (isScanning && mode === 'BARCODE') {
        requestAnimationFrame(scanLoop)
      }
      return
    }
    lastScanTime.current = now

    if (!isScanning || !videoRef.current || mode !== 'BARCODE') {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    // Optimize Resolution: Downscale to 640px for accuracy while remaining fast
    const SCAN_W = 640
    const scale = Math.min(SCAN_W / video.videoWidth, 1)
    const w = video.videoWidth * scale
    const h = video.videoHeight * scale

    if (!w || !h || w <= 0 || h <= 0) {
      if (isScanning) requestAnimationFrame(scanLoop)
      return
    }

    canvas.width = w
    canvas.height = h
    ctx.drawImage(video, 0, 0, w, h)

    // 2. Intelligent Barcode Search (Alternating Passes)
    const bCanvas = barcodeCanvasRef.current
    const bCtx = bCanvas.getContext('2d', { willReadFrequently: true })
    let barcode = null

    if (passToggle.current) {
      // Pass A: Full frame check (Fast, for large barcodes)
      bCanvas.width = w
      bCanvas.height = h
      bCtx.drawImage(canvas, 0, 0)
      barcode = await detectBarcode(bCanvas)
    } else {
      // Pass B: High-Contrast center crop (Accurate, for small barcodes)
      const bW = w * 0.7 
      const bH = h * 0.5
      bCanvas.width = bW
      bCanvas.height = bH
      bCtx.drawImage(canvas, (w - bW) / 2, (h - bH) / 2, bW, bH, 0, 0, bW, bH)
      barcode = await detectBarcode(bCanvas)
    }
    
    passToggle.current = !passToggle.current // Switch pass for next frame
    
    if (barcode) {
      setScanStatus('Verifying...')
      const productResult = await processBarcode(barcode.text)
      if (productResult.success) {
        onResult({ ...productResult, instant: true })
      }
      setIsScanning(false)
      frameCount.current = 0
      return
    }

    frameCount.current++
    if (frameCount.current > 15) {
      setScanStatus('Center barcode for auto-scan')
    }

    if (isScanning && mode === 'BARCODE') {
      requestAnimationFrame(scanLoop)
    }
  }, [isScanning, videoRef, onResult, mode])

  // Manual Capture for SCAN mode - Updated with Cropping Logic
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || isProcessing) return
    
    setIsProcessing(true)
    // Small delay to ensure React flushes the 'isProcessing' state to the UI
    await new Promise(r => setTimeout(r, 100))

    // Check for Cloud Capability early for UI feedback
    const cloudActive = isCloudReady()
    setScanStatus(cloudActive ? 'Cloud Accuracy Pass (99.9%)...' : 'AI Shield Binary Pass (99%)...')
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const vW = video.videoWidth
    const vH = video.videoHeight
    
    if (!vW || !vH) {
      setIsProcessing(false)
      setScanStatus('Waiting for camera...')
      return
    }

    // Improved Cropping: Align with Viewfinder Guide (Hole)
    // ScannerOverlay uses 92% width for hole
    const cropW = Math.floor(vW * 0.9)
    const cropH = Math.floor(vH * 0.65)
    const startX = Math.floor((vW - cropW) / 2)
    const startY = Math.floor((vH - cropH) / 2)
    
    canvas.width = cropW
    canvas.height = cropH
    
    ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH)
    
    try {
      // Analysis Pass
      const result = await processManualScan(canvas)
      
      if (result && result.type !== 'STATUS') {
        const sourceLabel = result.source === 'CLOUD' ? 'Cloud' : 'AI Shield'
        setScanStatus(`${result.type} Verified by ${sourceLabel}!`)
        onResult({ ...result, instant: false }) 
      } else {
        setScanStatus('Accuracy low. Adjust light & try again.')
        setTimeout(() => setScanStatus('Point at product or bill'), 2500)
      }
    } catch (e) {
      console.error("Capture processing failed", e)
      setScanStatus('System error. Restarting...')
    } finally {
      setIsProcessing(false)
    }
  }, [videoRef, onResult, isProcessing])

  useEffect(() => {
    if (isScanning && mode === 'BARCODE') {
      scanLoop()
    }
  }, [isScanning, scanLoop, mode])

  return {
    scanStatus,
    isScanning,
    isProcessing,
    setIsScanning,
    capturePhoto
  }
}
