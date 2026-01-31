'use client'

import { useState } from 'react'
import { Flame, ArrowRight, Zap, Gem } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'
import { createClient } from '@/lib/supabase/client'

export default function CraftPanel() {
  const { wallet, updateWallet, userId } = useGameStore()
  const [craftAmount, setCraftAmount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Craft rates: 100 Energy + 10 Rare = 1 Fuel
  const energyCostPer = 100
  const rareCostPer = 10

  const totalEnergyCost = craftAmount * energyCostPer
  const totalRareCost = craftAmount * rareCostPer

  const canCraft = wallet.energy >= totalEnergyCost && wallet.rare_resources >= totalRareCost

  const maxCraftable = Math.min(
    Math.floor(wallet.energy / energyCostPer),
    Math.floor(wallet.rare_resources / rareCostPer)
  )

  const handleCraft = async () => {
    if (!userId || !canCraft) return

    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .rpc('craft_fuel', {
          p_user_id: userId,
          p_amount: craftAmount
        })

      if (error) throw error

      if (data.success) {
        // Update local state
        updateWallet({
          energy: wallet.energy - totalEnergyCost,
          rare_resources: wallet.rare_resources - totalRareCost,
          fuel: wallet.fuel + craftAmount
        })

        setMessage({
          type: 'success',
          text: `Successfully crafted ${craftAmount} Fuel!`
        })

        // Reset amount
        setCraftAmount(1)

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error(data.error || 'Failed to craft fuel')
      }
    } catch (error: any) {
      console.error('Craft error:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Failed to craft fuel'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-orange-400" />
        <h2 className="text-xl font-bold text-gray-200">Craft Fuel</h2>
      </div>

      {/* Craft Recipe */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
        <p className="text-sm text-gray-400 mb-3">Recipe (per 1 Fuel):</p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">100 Energy</span>
          </div>
          <span className="text-gray-500">+</span>
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold">10 Rare</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-white font-bold">1 Fuel</span>
          </div>
        </div>
      </div>

      {/* Amount Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Amount to craft:
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max={maxCraftable}
            value={craftAmount}
            onChange={(e) => setCraftAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => setCraftAmount(maxCraftable)}
            disabled={maxCraftable === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg border border-gray-600 transition-colors text-sm font-medium"
          >
            Max
          </button>
        </div>
        {maxCraftable > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Max craftable: {maxCraftable} Fuel
          </p>
        )}
      </div>

      {/* Cost Display */}
      <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
        <p className="text-sm text-gray-400 mb-2">Total cost:</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white">{totalEnergyCost.toLocaleString()} Energy</span>
            </div>
            <span className={wallet.energy >= totalEnergyCost ? 'text-green-400' : 'text-red-400'}>
              {wallet.energy.toLocaleString()} available
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gem className="w-4 h-4 text-purple-400" />
              <span className="text-white">{totalRareCost.toLocaleString()} Rare</span>
            </div>
            <span className={wallet.rare_resources >= totalRareCost ? 'text-green-400' : 'text-red-400'}>
              {wallet.rare_resources.toLocaleString()} available
            </span>
          </div>
        </div>
      </div>

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

      {/* Craft Button */}
      <button
        onClick={handleCraft}
        disabled={!canCraft || loading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Flame className="w-5 h-5" />
        {loading ? 'Crafting...' : `Craft ${craftAmount} Fuel`}
      </button>

      {!canCraft && maxCraftable === 0 && (
        <p className="text-red-400 text-sm text-center mt-2">
          Insufficient resources! Keep clicking to gather more.
        </p>
      )}
    </div>
  )
}
