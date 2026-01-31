'use client'

import { Zap, Gem, Flame, Coins } from 'lucide-react'
import { useGameStore } from '@/lib/store/gameStore'

export default function Wallet() {
  const wallet = useGameStore((state) => state.wallet)

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(2) + 'M'
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-200">Wallet</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Energy */}
        <div className="bg-gray-900 rounded-lg p-4 border-2 border-yellow-500">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Energy</span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {formatNumber(wallet.energy)}
          </p>
        </div>

        {/* Rare Resources */}
        <div className="bg-gray-900 rounded-lg p-4 border-2 border-purple-500">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-400">Rare</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {formatNumber(wallet.rare_resources)}
          </p>
        </div>

        {/* Fuel */}
        <div className="bg-gray-900 rounded-lg p-4 border-2 border-orange-500">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-sm text-gray-400">Fuel</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">
            {formatNumber(wallet.fuel)}
          </p>
        </div>

        {/* YES Tokens */}
        <div className="bg-gray-900 rounded-lg p-4 border-2 border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">YES</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {formatNumber(wallet.yes_tokens)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ${(wallet.yes_tokens * 0.0001).toFixed(2)} USD
          </p>
        </div>
      </div>
    </div>
  )
}
