/**
 * useSmartScanner Hook
 * Encapsulates scanner state, frame loop, and result handling
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { runScanPipeline, processManualScan } from '../services/scanner/smartScanService'
import { detectBarcode, processBarcode } from '../services/scanner/barcodeDetector'

export function useSmartScanner(videoRef, onResult, mode = 'BARCODE') {
  const [scanStatus, setScanStatus] = useState('Point at product or bill')
  const [isScanning, setIsScanning] = useState(false)
  const canvasRef = useRef(document.createElement('canvas'))
  const barcodeCanvasRef = useRef(document.createElement('canvas'))
  const highResCanvasRef = useRef(document.createElement('canvas'))
  const frameCount = useRef(0)

  const scanLoop = useCallback(async () => {
    // Only perform auto-scanning loop if isScanning is true AND we are in BARCODE mode
    if (!isScanning || !videoRef.current || mode !== 'BARCODE') {
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    // Optimize Resolution: Downscale to 640px for 4x faster processing
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

    // 1. Optimized Barcode Search (Focus on center viewfinder)
    setScanStatus('Searching for Barcode...')
    
    // Reuse bCanvas for performance
    const bCanvas = barcodeCanvasRef.current
    const bCtx = bCanvas.getContext('2d', { willReadFrequently: true })
    const bW = w * 0.7 
    const bH = h * 0.4
    if (bCanvas.width !== bW) {
      bCanvas.width = bW
      bCanvas.height = bH
    }
    
    // Draw the center part of the main canvas into the barcode canvas
    bCtx.drawImage(canvas, (w - bW) / 2, (h - bH) / 2, bW, bH, 0, 0, bW, bH)
    
    const barcode = await detectBarcode(bCanvas)
    
    if (barcode) {
      setScanStatus('Decoding Barcode...')
      const productResult = await processBarcode(barcode.text)
      onResult({ type: 'BARCODE', result: productResult, instant: true })
      setIsScanning(false)
      frameCount.current = 0
      return
    }

    // 2. Isolated Fallback to OCR (Two-Stage: Detect & Extract)
    frameCount.current++
    if (frameCount.current > 15) {
      // Step A: Fast Detection (Low-Res, Fast Mode)
      // This is near-instant even on 4K devices
      const detection = await runScanPipeline(video, canvas, false, true)
      
      if (detection && detection.type === 'BILL') {
        const isStrongMatch = detection.confidence > 5
        const isForced = frameCount.current > 60 // ~2s timeout for shaky hands
        
        if (isStrongMatch || isForced) {
           setScanStatus('High-Precision Extracting...')
           // Step B: Deep Extraction (High-Res, Multi-Pass)
           // We use the full video resolution for maximum accuracy
           const hrCanvas = highResCanvasRef.current
           const hrCtx = hrCanvas.getContext('2d')
           hrCanvas.width = video.videoWidth
           hrCanvas.height = video.videoHeight
           hrCtx.drawImage(video, 0, 0)
           
           const deepResult = await runScanPipeline(video, hrCanvas, true, false)
           if (deepResult && (deepResult.type === 'BILL' || deepResult.type === 'PRODUCT')) {
             setScanStatus(`${deepResult.type} Captured!`)
             onResult({ ...deepResult, instant: true })
             setIsScanning(false)
             frameCount.current = 0
             return
           }
        } else {
           setScanStatus('Aligning Bill...')
        }
      } else if (detection && detection.type === 'STATUS') {
        setScanStatus(detection.message)
      } else {
        setScanStatus('Searching for items...')
      }
    }

    if (isScanning && mode === 'BARCODE') {
      requestAnimationFrame(scanLoop)
    }
  }, [isScanning, videoRef, onResult, mode])

  // Manual Capture for SCAN mode - Updated with Cropping Logic
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return
    
    setScanStatus('Reading Image...')
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const vW = video.videoWidth
    const vH = video.videoHeight
    
    // SCAN mode Frame dimensions in % from ScannerOverlay:
    // w: 80vw, h: 60vh. But centered.
    // Normalized to video proportions:
    const cropW = vW * 0.8
    const cropH = vH * 0.6
    const startX = (vW - cropW) / 2
    const startY = (vH - cropH) / 2
    
    canvas.width = cropW
    canvas.height = cropH
    
    // Draw only the cropped portion
    ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH)
    
    // Process manually - This now uses the Multi-Pass Binary Shield
    // We update status periodically to show progress
    setScanStatus('Reading Image... (Binary Pass)')
    const result = await processManualScan(canvas)
    
    if (result && result.type !== 'STATUS') {
      setScanStatus(`${result.type} Captured!`)
      onResult({ ...result, instant: false }) 
    } else {
      setScanStatus('Could not read accurately. Try again.')
      setTimeout(() => setScanStatus('Point at product or bill'), 2000)
    }
  }, [videoRef, onResult])

  useEffect(() => {
    if (isScanning && mode === 'BARCODE') {
      scanLoop()
    }
  }, [isScanning, scanLoop, mode])

  return {
    scanStatus,
    isScanning,
    setIsScanning,
    capturePhoto
  }
}
