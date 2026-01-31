'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, X } from 'lucide-react'

interface CaptchaSliderProps {
  onSuccess: () => void
  onFail: () => void
}

export default function CaptchaSlider({ onSuccess, onFail }: CaptchaSliderProps) {
  const [position, setPosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showModal, setShowModal] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const maxAttempts = 3

  const targetPosition = 85 // Need to get to 85% to pass

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100
      setPosition(Math.max(0, Math.min(100, newPosition)))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      const newPosition = ((touch.clientX - rect.left) / rect.width) * 100
      setPosition(Math.max(0, Math.min(100, newPosition)))
    }

    const handleEnd = () => {
      if (!isDragging) return
      setIsDragging(false)

      if (position >= targetPosition) {
        // Success!
        setShowModal(false)
        setTimeout(() => onSuccess(), 300)
      } else {
        // Failed attempt
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setPosition(0)

        if (newAttempts >= maxAttempts) {
          setShowModal(false)
          setTimeout(() => onFail(), 300)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, position, attempts, onSuccess, onFail])

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border-2 border-blue-500 max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-500 p-3 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Verify You're Human</h2>
        <p className="text-gray-400 text-center mb-6">
          Slide to the right to continue
        </p>

        <div
          ref={sliderRef}
          className="relative h-16 bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden mb-4"
        >
          {/* Background progress */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
            style={{ width: `${position}%` }}
          />

          {/* Slider handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-lg shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center transition-all"
            style={{ left: `calc(${position}% - 28px)` }}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
          >
            <div className="text-2xl">
              {position >= targetPosition ? '✅' : '→'}
            </div>
          </div>

          {/* Guide text */}
          {position < targetPosition && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-500 font-medium">
                Slide to verify →
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            Attempts: {attempts}/{maxAttempts}
          </span>
          <span className="text-gray-500">
            {position >= targetPosition ? 'Release to verify ✓' : 'Keep sliding →'}
          </span>
        </div>

        {attempts > 0 && attempts < maxAttempts && (
          <div className="mt-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ Failed! Slide all the way to the right. {maxAttempts - attempts} attempts left.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
