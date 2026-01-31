'use client'

import { useState, useEffect } from 'react'
import { Zap, Sparkles } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { createClient } from '@/lib/supabase/client'
import CaptchaSlider from './CaptchaSlider'

export default function Clicker() {
  const { wallet, updateWallet, userId, planet } = useGameStore()
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; id: number }[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [nextEffectId, setNextEffectId] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState(Date.now())
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [clicksSinceCaptcha, setClicksSinceCaptcha] = useState(0)

  // Check if 2x boost is active
  const [is2xActive, setIs2xActive] = useState(false)

  useEffect(() => {
    // Check boost status every second
    const interval = setInterval(() => {
      const boostData = localStorage.getItem('boost2x')
      if (boostData) {
        const { expiresAt } = JSON.parse(boostData)
        setIs2xActive(Date.now() < expiresAt)
      } else {
        setIs2xActive(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Bonus from planet
  const energyBonus = planet?.bonus_energy_production || 0
  const rareDropBonus = planet?.bonus_rare_drop_rate || 0
  const baseRareChance = 5 // 5% base chance
  const totalRareChance = baseRareChance + rareDropBonus

  // Energy per click (base 1, with bonus, with 2x boost)
  const baseEnergyPerClick = Math.floor(1 * (1 + energyBonus / 100))
  const energyPerClick = is2xActive ? baseEnergyPerClick * 2 : baseEnergyPerClick

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!userId) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Add visual effect
    const effectId = nextEffectId
    setClickEffect(prev => [...prev, { x, y, id: effectId }])
    setNextEffectId(prev => prev + 1)

    // Remove effect after animation
    setTimeout(() => {
      setClickEffect(prev => prev.filter(effect => effect.id !== effectId))
    }, 1000)

    // Energy gained (with 2x boost if active)
    const energyGained = energyPerClick
    
    // Check for rare drop
    const rareDrop = Math.random() * 100 < totalRareChance ? 1 : 0

    // Update local state immediately
    updateWallet({
      energy: wallet.energy + energyGained,
      rare_resources: wallet.rare_resources + rareDrop
    })

    setTotalClicks(prev => prev + 1)
    setClicksSinceCaptcha(prev => prev + 1)

    // Trigger captcha randomly after 200-400 clicks (15-30 min of active clicking)
    if (clicksSinceCaptcha > 200) {
      const captchaChance = (clicksSinceCaptcha - 200) / 200 // Increases chance after 200 clicks
      if (Math.random() < captchaChance * 0.01) { // Max 1% chance per click after 200
        setShowCaptcha(true)
        setClicksSinceCaptcha(0)
      }
    }

    // Sync to database every 5 clicks (more frequent!)
    if ((totalClicks + 1) % 5 === 0) {
      try {
        const supabase = createClient()
        await supabase
          .from('wallets')
          .update({
            energy: wallet.energy + energyGained,
            rare_resources: wallet.rare_resources + rareDrop,
          })
          .eq('user_id', userId)
        
        setLastSyncTime(Date.now())
      } catch (error) {
        console.error('Failed to sync wallet:', error)
      }
    }

    // Check for random event trigger (5% chance per click)
    if (Math.random() < 0.05) {
      triggerRandomEvent()
    }
  }

  const triggerRandomEvent = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('trigger_random_event', {
          p_user_id: userId
        })

      if (error) throw error

      console.log('Random event triggered:', data)
    } catch (error) {
      console.error('Failed to trigger random event:', error)
    }
  }

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false)
    setClicksSinceCaptcha(0)
  }

  const handleCaptchaFail = () => {
    setShowCaptcha(false)
    alert('⚠️ Captcha failed! Please refresh the page to continue.')
    // Force refresh after 2 seconds
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  return (
    <>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-gray-200">Energy Generator</h2>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-gray-400">Energy per click</p>
              <p className={`font-bold ${is2xActive ? 'text-yellow-300' : 'text-yellow-400'}`}>
                +{energyPerClick}
                {is2xActive && (
                  <span className="text-yellow-300 text-xs ml-1 animate-pulse">2x BOOST! ⚡</span>
                )}
                {!is2xActive && energyBonus > 0 && (
                  <span className="text-green-400 text-xs ml-1">(+{energyBonus}%)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Rare drop chance</p>
              <p className="text-purple-400 font-bold">
                {totalRareChance}%
              </p>
            </div>
          </div>

          {/* Clicker Button */}
          <div className="relative">
            <button
              onClick={handleClick}
              className={`relative w-48 h-48 mx-auto bg-gradient-to-br ${
                is2xActive 
                  ? 'from-yellow-300 via-orange-400 to-red-400 shadow-yellow-400/70' 
                  : 'from-yellow-400 via-orange-500 to-red-500 shadow-yellow-500/50'
              } rounded-full shadow-2xl hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 border-4 ${
                is2xActive ? 'border-yellow-200 animate-pulse' : 'border-yellow-300 animate-pulse-border'
              } overflow-hidden`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-transparent to-transparent opacity-50 animate-pulse"></div>
              
              {/* Icon */}
              <Zap className="w-24 h-24 mx-auto text-white drop-shadow-lg relative z-10" />

              {/* Click effects */}
              {clickEffect.map((effect) => (
                <div
                  key={effect.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: effect.x,
                    top: effect.y,
                    animation: 'float-up 1s ease-out forwards',
                  }}
                >
                  <div className={`font-bold text-xl drop-shadow-lg ${
                    is2xActive ? 'text-yellow-300' : 'text-yellow-400'
                  }`}>
                    +{energyPerClick}
                  </div>
                </div>
              ))}
            </button>

            {/* Sparkles */}
            <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute bottom-0 left-0 w-6 h-6 text-orange-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Hint */}
          <p className="text-gray-400 text-sm">
            Click to generate energy! <br />
            <span className="text-purple-400">Rare resources</span> can drop randomly
          </p>
        </div>

        {/* Animation keyframes */}
        <style jsx>{`
          @keyframes float-up {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-50px) scale(1.2);
            }
          }
        `}</style>
      </div>

      {/* Captcha Modal */}
      {showCaptcha && (
        <CaptchaSlider
          onSuccess={handleCaptchaSuccess}
          onFail={handleCaptchaFail}
        />
      )}
    </>
  )
}
