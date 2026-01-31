import { create } from 'zustand'

export interface Wallet {
  energy: number
  rare_resources: number
  fuel: number
  yes_tokens: number
  mini_yes: number
}

export interface Planet {
  id: string
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  max_tiles: number
  discovered_tiles: number
  base_resources_percent: number
  rare_resources_percent: number
  buildable_tiles_percent: number
  bonus_energy_production: number
  bonus_rare_drop_rate: number
  tier: number
  upgrade_cost_fuel: number
}

export interface AutoclickerSession {
  id: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  energy_per_second: number
  expires_at: string
  started_at: string
}

export interface RandomEvent {
  id: string
  event_type: string
  event_name: string
  event_description: string
  energy_reward: number
  rare_reward: number
  fuel_reward: number
  expires_at: string
}

interface GameStore {
  // User & Auth
  userId: string | null
  username: string | null
  setUser: (userId: string | null, username: string | null) => void

  // Wallet
  wallet: Wallet
  setWallet: (wallet: Wallet) => void
  updateWallet: (updates: Partial<Wallet>) => void

  // Planet
  planet: Planet | null
  setPlanet: (planet: Planet | null) => void

  // Autoclicker
  autoclicker: AutoclickerSession | null
  setAutoclicker: (session: AutoclickerSession | null) => void

  // Random Events
  activeEvent: RandomEvent | null
  setActiveEvent: (event: RandomEvent | null) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useGameStore = create<GameStore>((set) => ({
  // Initial state
  userId: null,
  username: null,
  wallet: {
    energy: 0,
    rare_resources: 0,
    fuel: 0,
    yes_tokens: 0,
    mini_yes: 0,
  },
  planet: null,
  autoclicker: null,
  activeEvent: null,
  isLoading: true,

  // Actions
  setUser: (userId, username) => set({ userId, username }),
  
  setWallet: (wallet) => set({ wallet }),
  
  updateWallet: (updates) => set((state) => ({
    wallet: { ...state.wallet, ...updates }
  })),

  setPlanet: (planet) => set({ planet }),

  setAutoclicker: (session) => set({ autoclicker: session }),

  setActiveEvent: (event) => set({ activeEvent: event }),

  setIsLoading: (loading) => set({ isLoading: loading }),
}))
