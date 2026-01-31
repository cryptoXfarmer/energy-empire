'use client'

import { useState, useEffect } from 'react'
import { Bot, Zap, Clock, Flame } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { createClient } from '@/lib/supabase/client'

const AUTOCLICKER_TIERS = [
  {
    tier: 'bronze',
    name: 'Bronze Autoclicker',
    duration: 30,
    energyPerSec: 2,
    cost: { energy: 500, fuel: 0 },
    color: 'from-amber-600 to-amber-800'
  },
  {
    tier: 'silver',
    name: 'Silver Autoclicker',
    duration: 120,
    energyPerSec: 5,
    cost: { energy: 2000, fuel: 0 },
    color: 'from-gray-400 to-gray-600'
  },
  {
    tier: 'gold',
    name: 'Gold Autoclicker',
    duration: 480,
    energyPerSec: 10,
    cost: { energy: 10000, fuel: 0 },
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    tier: 'platinum',
    name: 'Platinum Autoclicker',
    duration: 1440,
    energyPerSec: 20,
    cost: { energy: 0, fuel: 1 },
    color: 'from-cyan-400 to-blue-600'
  },
] as const

export default function AutoclickerPanel() {
  const { wallet, updateWallet, userId, autoclicker, setAutoclicker } = useGameStore()
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Check for active autoclicker on mount
  useEffect(() => {
    if (!userId) return
    checkActiveAutoclicker()
  }, [userId])

  // Claim energy every 30 seconds if autoclicker is active
  useEffect(() => {
    if (!autoclicker) return

    const interval = setInterval(async () => {
      await claimAutoclickerEnergy()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [autoclicker])

  // Update time remaining
  useEffect(() => {
    if (!autoclicker) return

    const updateTime = () => {
      const now = new Date().getTime()
      const expiresAt = new Date(autoclicker.expires_at).getTime()
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
      setTimeRemaining(remaining)

      if (remaining === 0) {
        setAutoclicker(null)
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [autoclicker])

  const checkActiveAutoclicker = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('autoclicker_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        setAutoclicker(data)
      }
    } catch (error) {
      console.error('Failed to check autoclicker:', error)
    }
  }

  const claimAutoclickerEnergy = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('claim_autoclicker_energy', {
          p_user_id: userId
        })

      if (error) throw error

      if (data.success) {
        updateWallet({
          energy: wallet.energy + data.energy_generated
        })
      }
    } catch (error) {
      console.error('Failed to claim autoclicker energy:', error)
    }
  }

  const activateAutoclicker = async (tier: string, paymentMethod: 'energy' | 'fuel') => {
    if (!userId) return

    setLoading(tier)
    setMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('activate_autoclicker', {
          p_user_id: userId,
          p_tier: tier,
          p_payment_method: paymentMethod
        })

      if (error) throw error

      if (data.success) {
        // Update wallet
        const tierData = AUTOCLICKER_TIERS.find(t => t.tier === tier)!
        if (paymentMethod === 'energy') {
          updateWallet({ energy: wallet.energy - tierData.cost.energy })
        } else {
          updateWallet({ fuel: wallet.fuel - tierData.cost.fuel })
        }

        // Set active autoclicker
        setAutoclicker({
          id: data.session_id,
          tier: data.tier,
          energy_per_second: data.energy_per_second,
          expires_at: data.expires_at,
          started_at: new Date().toISOString()
        })

        setMessage({
          type: 'success',
          text: `${tierData.name} activated for ${data.duration_minutes} minutes!`
        })
      } else {
        throw new Error(data.error || 'Failed to activate autoclicker')
      }
    } catch (error: any) {
      console.error('Activation error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to activate autoclicker'
      })
    } finally {
      setLoading(null)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-bold text-gray-200">Autoclicker</h2>
      </div>

      {/* Active Autoclicker Status */}
      {autoclicker && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-green-400 animate-pulse" />
              <span className="text-green-400 font-bold">Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white">+{autoclicker.energy_per_second}/s</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">{formatTime(timeRemaining)} remaining</span>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-900/50 border border-green-500 text-green-200' 
            : 'bg-red-900/50 border border-red-500 text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Autoclicker Tiers */}
      <div className="space-y-3">
        {AUTOCLICKER_TIERS.map((tier) => {
          const canAffordEnergy = wallet.energy >= tier.cost.energy
          const canAffordFuel = wallet.fuel >= tier.cost.fuel
          const isDisabled = autoclicker !== null || (!canAffordEnergy && !canAffordFuel)

          return (
            <div
              key={tier.tier}
              className="bg-gray-900 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                  {tier.name}
                </h3>
                <div className="flex items-center gap-1 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">+{tier.energyPerSec}/s</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Clock className="w-4 h-4" />
                <span>{tier.duration} minutes</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => activateAutoclicker(tier.tier, 'energy')}
                  disabled={isDisabled || !canAffordEnergy || tier.cost.energy === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  {tier.cost.energy > 0 && (
                    <>
                      <Zap className="w-4 h-4" />
                      {tier.cost.energy.toLocaleString()}
                    </>
                  )}
                  {loading === tier.tier ? 'Activating...' : tier.cost.energy === 0 ? 'N/A' : 'Activate'}
                </button>

                <button
                  onClick={() => activateAutoclicker(tier.tier, 'fuel')}
                  disabled={isDisabled || !canAffordFuel || tier.cost.fuel === 0}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  {tier.cost.fuel > 0 && (
                    <>
                      <Flame className="w-4 h-4" />
                      {tier.cost.fuel}
                    </>
                  )}
                  {loading === tier.tier ? 'Activating...' : tier.cost.fuel === 0 ? 'N/A' : 'Activate'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
