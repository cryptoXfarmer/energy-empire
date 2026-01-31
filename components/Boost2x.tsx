'use client'

import { useState, useEffect } from 'react'
import { Zap, X } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { createClient } from '@/lib/supabase/client'

export default function Boost2x() {
  const { userId, wallet, updateWallet } = useGameStore()
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if boost is active on mount
  useEffect(() => {
    const boostData = localStorage.getItem('boost2x')
    if (boostData) {
      const { expiresAt } = JSON.parse(boostData)
      const remaining = Math.floor((expiresAt - Date.now()) / 1000)
      if (remaining > 0) {
        setIsActive(true)
        setTimeRemaining(remaining)
      } else {
        localStorage.removeItem('boost2x')
      }
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false)
          localStorage.removeItem('boost2x')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const activateBoostWithFuel = async () => {
    if (wallet.fuel < 5) {
      alert('Not enough Fuel! You need 5 Fuel.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      
      // Deduct 5 fuel
      const { error } = await supabase
        .from('wallets')
        .update({ fuel: wallet.fuel - 5 })
        .eq('user_id', userId)

      if (error) throw error

      // Activate boost for 5 minutes
      const expiresAt = Date.now() + 5 * 60 * 1000
      localStorage.setItem('boost2x', JSON.stringify({ expiresAt }))
      
      updateWallet({ fuel: wallet.fuel - 5 })
      setIsActive(true)
      setTimeRemaining(300) // 5 minutes
      setShowModal(false)
    } catch (error) {
      console.error('Failed to activate boost:', error)
      alert('Failed to activate boost. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const activateBoostWithAd = () => {
    // In production, integrate with ad network (PropellerAds, etc)
    // For now, simulate watching an ad
    alert('🎬 Ad integration coming soon! For now, getting free boost...')
    
    const expiresAt = Date.now() + 5 * 60 * 1000
    localStorage.setItem('boost2x', JSON.stringify({ expiresAt }))
    
    setIsActive(true)
    setTimeRemaining(300)
    setShowModal(false)
  }

  if (isActive) {
    return (
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500 p-2 rounded-lg animate-pulse">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-400">2x BOOST ACTIVE!</h3>
              <p className="text-sm text-gray-400">All clicks give +2 Energy</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-xs text-gray-500">remaining</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      >
        <Zap className="w-5 h-5" />
        Activate 2x Boost
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-yellow-400">2x Energy Boost</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-yellow-400">What you get:</span>
                </div>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>• Double energy per click (+2 instead of +1)</li>
                  <li>• Duration: 5 minutes</li>
                  <li>• Works with manual clicking</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={activateBoostWithAd}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                📺 Watch Ad (Free)
              </button>

              <button
                onClick={activateBoostWithFuel}
                disabled={loading || wallet.fuel < 5}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
              >
                🔥 Pay 5 Fuel
                {wallet.fuel < 5 && (
                  <span className="block text-xs mt-1">
                    (Need {5 - wallet.fuel} more Fuel)
                  </span>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              💡 Tip: Use boost when actively clicking!
            </p>
          </div>
        </div>
      )}
    </>
  )
}
