'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isUserSignedIn, getUserData, connectWallet } from '@/lib/stacks';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (isUserSignedIn()) {
      const userData = getUserData();
      setUser(userData);
    }
  }, []);

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isUserSignedIn() && user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back to sBTC Treasury Manager
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your wallet is connected. Access your treasury dashboard to manage your sBTC payments and yield strategies.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link href="/dashboard">
                <Button size="lg">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/checkout-demo">
                <Button variant="outline" size="lg">
                  Try Payment Widget
                </Button>
              </Link>
            </div>
            
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">
                  <p>Connected Address:</p>
                  <p className="font-mono mt-1">
                    {user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              Stacks Hackathon 2025 🏆
            </Badge>
            <h1 className="text-5xl font-bold tracking-tight">
              sBTC Treasury Manager
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The first automated treasury management system for businesses accepting sBTC payments. 
              Combine payment processing with intelligent yield optimization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Accept Payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Process sBTC payments with our easy-to-integrate checkout widget. 
                  Stripe-like experience for Bitcoin payments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📈</span>
                  <span>Earn Yield</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically deploy idle sBTC to DeFi protocols while maintaining 
                  configurable liquidity for instant access.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Smart Treasury</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time dashboard with analytics, yield tracking, and one-click 
                  rebalancing powered by Stacks smart contracts.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button onClick={connectWallet} size="lg" className="text-lg">
              Connect Stacks Wallet
            </Button>
            <p className="text-sm text-muted-foreground">
              Connect your Stacks wallet to access the treasury management dashboard
            </p>
          </div>

          <div className="border-t pt-8 mt-12">
            <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Stacks Blockchain</Badge>
                <span>Bitcoin Finality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Smart Contracts</Badge>
                <span>Clarity Language</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">DeFi Integration</Badge>
                <span>Yield Strategies</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
