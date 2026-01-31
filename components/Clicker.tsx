'use client'

import { useState, useEffect, useCallback } from 'react'
import { Zap, Sparkles } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { createClient } from '@/lib/supabase/client'

export default function Clicker() {
  const { wallet, updateWallet, userId, planet } = useGameStore()
  const [clickEffect, setClickEffect] = useState<{ x: number; y: number; id: number }[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [nextEffectId, setNextEffectId] = useState(0)

  // Bonus from planet
  const energyBonus = planet?.bonus_energy_production || 0
  const rareDropBonus = planet?.bonus_rare_drop_rate || 0
  const baseRareChance = 5 // 5% base chance
  const totalRareChance = baseRareChance + rareDropBonus

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

    // Calculate energy gained (1 + bonus%)
    const energyGained = Math.floor(1 * (1 + energyBonus / 100))
    
    // Check for rare drop (5% + bonus%)
    const rareDrop = Math.random() * 100 < totalRareChance ? 1 : 0

    // Update local state immediately for responsiveness
    updateWallet({
      energy: wallet.energy + energyGained,
      rare_resources: wallet.rare_resources + rareDrop
    })

    setTotalClicks(prev => prev + 1)

    // Sync to database every 10 clicks
    if ((totalClicks + 1) % 10 === 0) {
      try {
        const supabase = createClient()
        await supabase
          .from('wallets')
          .update({
            energy: wallet.energy + energyGained,
            rare_resources: wallet.rare_resources + rareDrop,
          })
          .eq('user_id', userId)
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

      // Show event popup (will be handled by RandomEventPopup component)
      console.log('Random event triggered:', data)
    } catch (error) {
      console.error('Failed to trigger random event:', error)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-200">Energy Generator</h2>
        
        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm">
          <div>
            <p className="text-gray-400">Energy per click</p>
            <p className="text-yellow-400 font-bold">
              +{Math.floor(1 * (1 + energyBonus / 100))}
              {energyBonus > 0 && (
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
            className="relative w-48 h-48 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all transform hover:scale-105 active:scale-95 border-4 border-yellow-300 animate-pulse-border overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-transparent to-transparent opacity-50 animate-pulse"></div>
            
            {/* Icon */}
            <Zap className="w-24 h-24 mx-auto text-white drop-shadow-lg relative z-10" />

            {/* Click effects */}
            {clickEffect.map((effect) => (
              <div
                key={effect.id}
                className="absolute pointer-events-none animate-bounce-slow"
                style={{
                  left: effect.x,
                  top: effect.y,
                  animation: 'float-up 1s ease-out forwards',
                }}
              >
                <div className="text-yellow-400 font-bold text-xl drop-shadow-lg">
                  +{Math.floor(1 * (1 + energyBonus / 100))}
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
  )
}
