'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/lib/store/gameStore'
import Wallet from '@/components/Wallet'
import Clicker from '@/components/Clicker'
import AutoclickerPanel from '@/components/AutoclickerPanel'
import CraftPanel from '@/components/CraftPanel'
import Boost2x from '@/components/Boost2x'
import SyncStatus from '@/components/SyncStatus'
import { LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { userId, username, setUser, setWallet, setPlanet, setIsLoading, isLoading } = useGameStore()
  const [mounted, setMounted] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(Date.now())

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadUserData()
  }, [mounted])

  // Auto-sync every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      syncWallet()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [userId])

  const loadUserData = async () => {
    const supabase = createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      router.push('/login')
      return
    }

    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setUser(user.id, profile.username)

      // Load wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (walletError) throw walletError

      setWallet({
        energy: wallet.energy,
        rare_resources: wallet.rare_resources,
        fuel: wallet.fuel,
        yes_tokens: wallet.yes_tokens,
        mini_yes: wallet.mini_yes
      })

      // Load planet
      const { data: planet, error: planetError } = await supabase
        .from('planets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (planet && !planetError) {
        setPlanet(planet)
      }

      setIsLoading(false)
      setLastSyncTime(Date.now())
    } catch (error) {
      console.error('Failed to load user data:', error)
      setIsLoading(false)
    }
  }

  const syncWallet = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!error && wallet) {
        setWallet({
          energy: wallet.energy,
          rare_resources: wallet.rare_resources,
          fuel: wallet.fuel,
          yes_tokens: wallet.yes_tokens,
          mini_yes: wallet.mini_yes
        })
        setLastSyncTime(Date.now())
      }
    } catch (error) {
      console.error('Failed to sync wallet:', error)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your empire...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ENERGY EMPIRE
              </h1>
              <p className="text-xs text-gray-500">YieldVerse Metaverse</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <SyncStatus lastSyncTime={lastSyncTime} />

              {/* User Info */}
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium">{username}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Wallet */}
          <Wallet />

          {/* 2x Boost Button */}
          <Boost2x />

          {/* Game Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Clicker />
              <CraftPanel />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <AutoclickerPanel />
              
              {/* Quick Stats - Coming Soon */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Energy Earned</span>
                    <span className="text-yellow-400">Coming soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Fuel Crafted</span>
                    <span className="text-orange-400">Coming soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total YES Earned</span>
                    <span className="text-green-400">Coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alpha Notice */}
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-center">
            <p className="text-blue-300 text-sm">
              🚀 Alpha version - More features coming soon! Report bugs to get rewards!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
