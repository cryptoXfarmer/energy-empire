import Link from 'next/link'
import { Zap, Gem, Flame, Coins } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          {/* Logo / Title */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent animate-pulse-slow">
              ENERGY EMPIRE
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300">
              Part of the <span className="text-green-400 font-bold">YieldVerse</span> Metaverse
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-16">
            <div className="bg-gray-800 rounded-lg p-6 border-2 border-yellow-500 hover:border-yellow-400 transition-colors">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Mine Energy</h3>
              <p className="text-gray-400 text-sm">Click or automate to generate energy resources</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500 hover:border-purple-400 transition-colors">
              <Gem className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Rare Resources</h3>
              <p className="text-gray-400 text-sm">Discover valuable materials through random events</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-2 border-orange-500 hover:border-orange-400 transition-colors">
              <Flame className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Craft Fuel</h3>
              <p className="text-gray-400 text-sm">Combine resources to create precious Fuel</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border-2 border-green-500 hover:border-green-400 transition-colors">
              <Coins className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Earn YES Tokens</h3>
              <p className="text-gray-400 text-sm">Convert Fuel to YES and cash out real crypto</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-12">
            <Link 
              href="/register"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Playing Free
            </Link>
            <Link 
              href="/login"
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all border-2 border-gray-600"
            >
              Login
            </Link>
          </div>

          {/* Stats / Social Proof */}
          <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-400">100M</p>
              <p className="text-gray-400 mt-2">YES Token Supply</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">$0.10</p>
              <p className="text-gray-400 mt-2">Per YES Token</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-400">Free</p>
              <p className="text-gray-400 mt-2">To Play & Earn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Part of the YieldVerse Ecosystem</p>
          <p className="mt-2 text-sm">
            Energy Empire • YieldVerse Hub • Starforge PTC
          </p>
        </div>
      </footer>
    </main>
  );
}
