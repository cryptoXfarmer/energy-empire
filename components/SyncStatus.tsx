'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface SyncStatusProps {
  lastSyncTime?: number
}

export default function SyncStatus({ lastSyncTime }: SyncStatusProps) {
  const [status, setStatus] = useState<'online' | 'syncing' | 'offline'>('online')
  const [timeSinceSync, setTimeSinceSync] = useState(0)

  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setStatus(navigator.onLine ? 'online' : 'offline')
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  useEffect(() => {
    if (!lastSyncTime) return

    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastSyncTime) / 1000)
      setTimeSinceSync(seconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [lastSyncTime])

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'syncing':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-red-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'syncing':
        return 'Syncing...'
      case 'offline':
        return 'Offline'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <Wifi className="w-3 h-3" />
      case 'syncing':
        return <RefreshCw className="w-3 h-3 animate-spin" />
      case 'offline':
        return <WifiOff className="w-3 h-3" />
    }
  }

  const formatTimeSince = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-gray-400 hidden sm:inline">{getStatusText()}</span>
        <span className="text-gray-400 sm:hidden">{getStatusIcon()}</span>
      </div>

      {/* Last sync time */}
      {lastSyncTime && status === 'online' && (
        <span className="text-gray-500 text-xs hidden md:inline">
          • Synced {formatTimeSince(timeSinceSync)}
        </span>
      )}
    </div>
  )
}
