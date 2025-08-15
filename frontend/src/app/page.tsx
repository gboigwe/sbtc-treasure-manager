'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { isUserSignedIn, connectWallet } from '@/lib/stacks';
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Zap, 
  Bitcoin, 
  Layers, 
  Globe, 
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  Award,
  Users,
  Activity,
  Sparkles,
  Lock,
  Coins
} from 'lucide-react';

// Particle component for background effect
const ParticleBackground = () => {
  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      return particle;
    });

    const container = document.querySelector('.particles');
    if (container) {
      particles.forEach(particle => container.appendChild(particle));
    }

    return () => {
      if (container) {
        particles.forEach(particle => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        });
      }
    };
  }, []);

  return <div className="particles"></div>;
};

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const [userConnected, setUserConnected] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserConnected(isUserSignedIn());
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center web3-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-bitcoin-neon mx-auto mb-4"></div>
          <div className="text-neon-bitcoin text-lg font-semibold">Initializing Web3 Interface...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-bg">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="nav-web3 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-bitcoin-neon to-stacks-neon flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-hologram">sBTC Treasury</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#about" className="nav-link">About</a>
          </div>
          
          <div className="flex items-center space-x-4">
            {userConnected ? (
              <Link href="/dashboard">
                <button className="btn-web3">
                  <span className="flex items-center gap-2">
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-ghost"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              The Future of{' '}
              <span className="text-hologram">sBTC Treasury</span>{' '}
              Management
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Professional-grade Bitcoin treasury management with{' '}
              <span className="text-neon-bitcoin">real-time bridging</span>,{' '}
              <span className="text-neon-stacks">advanced analytics</span>, and{' '}
              <span className="text-gradient">seamless DeFi integration</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {userConnected ? (
              <Link href="/dashboard">
                <button className="btn-bitcoin text-lg px-12 py-4">
                  <span className="flex items-center gap-3">
                    Launch Dashboard <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-bitcoin text-lg px-12 py-4"
              >
                <span className="flex items-center gap-3">
                  Connect Wallet <Zap className="w-5 h-5" />
                </span>
              </button>
            )}
            <button className="btn-ghost text-lg px-12 py-4">
              <span className="flex items-center gap-3">
                View Demo <ArrowUpRight className="w-5 h-5" />
              </span>
            </button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="metric-card">
              <div className="metric-value">$250M+</div>
              <div className="metric-label">Assets Under Management</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-neon-stacks">99.9%</div>
              <div className="metric-label">Bridge Uptime</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-gradient">10K+</div>
              <div className="metric-label">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Powerful <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for institutional-grade treasury management with cutting-edge Web3 technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="neon-card-bitcoin">
              <div className="flex items-center justify-between mb-4">
                <Bitcoin className="w-8 h-8 text-bitcoin-neon" />
                <div className="w-12 h-12 rounded-full bg-bitcoin-neon/20 flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-bitcoin-neon" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-bitcoin">Real-time sBTC Bridge</h3>
              <p className="text-gray-300 mb-4">
                Instant Bitcoin to sBTC conversion with Emily API integration and live status tracking
              </p>
              <div className="flex items-center text-sm text-bitcoin-neon">
                <CheckCircle className="w-4 h-4 mr-2" />
                Emily Protocol Integration
              </div>
            </div>

            <div className="neon-card-stacks">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-stacks-neon" />
                <div className="w-12 h-12 rounded-full bg-stacks-neon/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-stacks-neon" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-stacks">Advanced Analytics</h3>
              <p className="text-gray-300 mb-4">
                Professional portfolio tracking with real-time metrics and performance insights
              </p>
              <div className="flex items-center text-sm text-stacks-neon">
                <CheckCircle className="w-4 h-4 mr-2" />
                Real-time Dashboard
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-cyber-blue" />
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyber-blue" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Security First</h3>
              <p className="text-gray-300 mb-4">
                Multi-signature security with hardware wallet support and audit trails
              </p>
              <div className="flex items-center text-sm text-cyber-blue">
                <CheckCircle className="w-4 h-4 mr-2" />
                Bank-grade Security
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <Layers className="w-8 h-8 text-cyber-green" />
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-cyber-green" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Multi-Chain Ready</h3>
              <p className="text-gray-300 mb-4">
                Seamless integration across Bitcoin, Stacks, and emerging Layer 2 solutions
              </p>
              <div className="flex items-center text-sm text-cyber-green">
                <CheckCircle className="w-4 h-4 mr-2" />
                Cross-chain Compatible
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-cyber-pink" />
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-cyber-pink" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">DeFi Integration</h3>
              <p className="text-gray-300 mb-4">
                Native support for yield farming, liquidity provision, and advanced DeFi strategies
              </p>
              <div className="flex items-center text-sm text-cyber-pink">
                <CheckCircle className="w-4 h-4 mr-2" />
                Yield Optimization
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8 text-cyber-purple" />
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-cyber-purple" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Global Access</h3>
              <p className="text-gray-300 mb-4">
                Decentralized architecture ensuring 24/7 global access without geographic restrictions
              </p>
              <div className="flex items-center text-sm text-cyber-purple">
                <CheckCircle className="w-4 h-4 mr-2" />
                Always Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              How It <span className="text-hologram">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Four simple steps to professional Bitcoin treasury management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-bitcoin-neon to-bitcoin-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-bitcoin">Connect Wallet</h3>
              <p className="text-gray-300">
                Link your hardware or software wallet securely to the sBTC Treasury platform
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-stacks-neon to-stacks-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-stacks">Bridge Assets</h3>
              <p className="text-gray-300">
                Convert Bitcoin to sBTC using the integrated Emily bridge with real-time tracking
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-green flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Manage Treasury</h3>
              <p className="text-gray-300">
                Deploy advanced strategies with professional analytics and risk management tools
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-purple flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Optimize Returns</h3>
              <p className="text-gray-300">
                Maximize yield through automated strategies and cross-chain opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="web3-glass rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-6">
                About <span className="text-hologram">sBTC Treasury</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                The future of Bitcoin treasury management is here. Built on the Stacks blockchain, 
                our platform combines the security of Bitcoin with the programmability of smart contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-bitcoin-neon/20 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-bitcoin-neon" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-neon-bitcoin">Security First</h3>
                      <p className="text-gray-300">
                        Built with institutional-grade security standards and multi-signature wallet support
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-stacks-neon/20 flex items-center justify-center flex-shrink-0">
                      <Coins className="w-6 h-6 text-stacks-neon" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-neon-stacks">Native sBTC</h3>
                      <p className="text-gray-300">
                        Seamless Bitcoin bridging with 1:1 backing and full transparency
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-cyber-blue/20 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-6 h-6 text-cyber-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gradient">Real-time Analytics</h3>
                      <p className="text-gray-300">
                        Professional-grade portfolio tracking with advanced metrics and insights
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="metric-card">
                  <div className="metric-value">100%</div>
                  <div className="metric-label">Decentralized</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value text-neon-stacks">24/7</div>
                  <div className="metric-label">Availability</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value text-gradient">1:1</div>
                  <div className="metric-label">BTC Backing</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value text-neon-bitcoin">∞</div>
                  <div className="metric-label">Scalability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Revolutionize Your{' '}
            <span className="text-hologram">Bitcoin Treasury</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the future of institutional Bitcoin management with cutting-edge Web3 technology
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {userConnected ? (
              <Link href="/dashboard">
                <button className="btn-bitcoin text-lg px-12 py-4">
                  <span className="flex items-center gap-3">
                    Launch Dashboard <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-bitcoin text-lg px-12 py-4"
              >
                <span className="flex items-center gap-3">
                  Get Started <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            )}
            <button className="btn-ghost text-lg px-12 py-4">
              <span className="flex items-center gap-3">
                Learn More <Globe className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-bitcoin-neon to-stacks-neon flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-hologram">sBTC Treasury</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 sBTC Treasury Manager. Built on Bitcoin & Stacks.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}