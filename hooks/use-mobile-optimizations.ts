"use client"

import { useEffect, useState, useCallback } from 'react'

interface MobileOptimizations {
  isMobile: boolean
  isTouch: boolean
  devicePixelRatio: number
  connectionSpeed: 'slow' | 'fast' | 'unknown'
  prefersReducedMotion: boolean
  isLowEndDevice: boolean
  touchStartHandler: (e: TouchEvent) => void
  touchEndHandler: (e: TouchEvent) => void
}

export function useMobileOptimizations(): MobileOptimizations {
  const [isMobile, setIsMobile] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const [devicePixelRatio, setDevicePixelRatio] = useState(1)
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Detect touch support
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Monitor device pixel ratio
  useEffect(() => {
    setDevicePixelRatio(window.devicePixelRatio || 1)
  }, [])

  // Detect connection speed
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const updateConnectionSpeed = () => {
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          setConnectionSpeed('slow')
        } else {
          setConnectionSpeed('fast')
        }
      }
      
      updateConnectionSpeed()
      connection.addEventListener('change', updateConnectionSpeed)
      
      return () => connection.removeEventListener('change', updateConnectionSpeed)
    }
  }, [])

  // Detect reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Detect low-end device (simple heuristic)
  useEffect(() => {
    const detectLowEndDevice = () => {
      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 1
      
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory || 4
      
      // Simple heuristic: consider low-end if < 2 cores or < 2GB RAM
      setIsLowEndDevice(cores < 2 || memory < 2)
    }

    detectLowEndDevice()
  }, [])

  // Optimized touch handlers with passive listeners
  const touchStartHandler = useCallback((e: TouchEvent) => {
    // Prevent 300ms click delay on mobile
    if (e.touches.length === 1) {
      e.preventDefault()
    }
  }, [])

  const touchEndHandler = useCallback((e: TouchEvent) => {
    // Handle touch end events efficiently
    if (e.changedTouches.length === 1) {
      // Trigger click on touch end for better responsiveness
      const touch = e.changedTouches[0]
      const target = document.elementFromPoint(touch.clientX, touch.clientY)
      if (target && target instanceof HTMLElement && target.click) {
        target.click()
      }
    }
  }, [])

  // Add global touch optimizations
  useEffect(() => {
    if (isTouch && isMobile) {
      // Add touch-action CSS optimization
      document.body.style.touchAction = 'manipulation'
      
      // Add passive touch listeners for better performance
      document.addEventListener('touchstart', touchStartHandler, { passive: false })
      document.addEventListener('touchend', touchEndHandler, { passive: true })
      
      return () => {
        document.removeEventListener('touchstart', touchStartHandler)
        document.removeEventListener('touchend', touchEndHandler)
        document.body.style.touchAction = ''
      }
    }
  }, [isTouch, isMobile, touchStartHandler, touchEndHandler])

  return {
    isMobile,
    isTouch,
    devicePixelRatio,
    connectionSpeed,
    prefersReducedMotion,
    isLowEndDevice,
    touchStartHandler,
    touchEndHandler
  }
}

// Utility hook for conditional mobile styling
export function useMobileClass(mobileClass: string, desktopClass: string = '') {
  const { isMobile } = useMobileOptimizations()
  return isMobile ? mobileClass : desktopClass
}

// Hook for adaptive loading based on device capabilities
export function useAdaptiveLoading() {
  const { connectionSpeed, isLowEndDevice, prefersReducedMotion } = useMobileOptimizations()
  
  return {
    shouldLazyLoad: connectionSpeed === 'slow' || isLowEndDevice,
    shouldReduceAnimations: prefersReducedMotion || isLowEndDevice,
    shouldOptimizeImages: connectionSpeed === 'slow',
    shouldPreload: connectionSpeed === 'fast' && !isLowEndDevice
  }
} 