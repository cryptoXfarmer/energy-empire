'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGameStore } from '@/lib/store/gameStore'
import Wallet from '@/components/Wallet'
import Clicker from '@/components/Clicker'
import AutoclickerPanel from '@/components/AutoclickerPanel'
import CraftPanel from '@/components/CraftPanel'
import { LogOut, User } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { userId, username, setUser, setWallet, setPlanet, setIsLoading, isLoading } = useGameStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadUserData()
  }, [mounted])

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
    } catch (error) {
      console.error('Failed to load user data:', error)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your empire...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ENERGY EMPIRE
              </h1>
              <p className="text-sm text-gray-400">YieldVerse Metaverse</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-white font-medium">{username}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Wallet - Full Width */}
          <Wallet />

          {/* Main Game Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Clicker />
              <CraftPanel />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <AutoclickerPanel />
              
              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="font-bold text-gray-200 mb-4">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Energy Earned</span>
                    <span className="text-yellow-400 font-medium">Coming soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Fuel Crafted</span>
                    <span className="text-orange-400 font-medium">Coming soon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total YES Earned</span>
                    <span className="text-green-400 font-medium">Coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 text-center">
            <p className="text-blue-200 text-sm">
              🚀 <strong>Alpha Version</strong> - Convert Fuel to YES and cash out LTC coming soon in YieldVerse Hub!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Part of the YieldVerse Metaverse Ecosystem</p>
        </div>
      </footer>
    </div>
  )
}
