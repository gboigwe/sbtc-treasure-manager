'use client';

import { useEffect, useState } from 'react';
import { TreasuryOverview } from '@/components/dashboard/treasury-overview';
import { PaymentHistory } from '@/components/dashboard/payment-history';
import { TransactionHistory } from '@/components/dashboard/transaction-history';
import { YieldStrategyManager } from '@/components/dashboard/yield-strategy-manager';
import { SettingsTab } from '@/components/dashboard/settings-tab';
import { RealDataDemo } from '@/components/dashboard/real-data-demo';
import { ContractStatus } from '@/components/contract-status';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { isUserSignedIn, getUserData, connectWallet, signOut } from '@/lib/stacks';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [treasuryData, setTreasuryData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    if (isUserSignedIn()) {
      const userData = getUserData();
      setUser(userData);
      initializeBusiness(userData);
    } else {
      setLoading(false);
    }
  }, []);

  const initializeBusiness = async (userData: any) => {
    try {
      const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
      
      // Try to get existing business from API
      try {
        const response = await api.getBusinessByWallet(walletAddress);
        setBusinessId(response.data.id);
        console.log('Business loaded from API:', response.data.id);
      } catch (error) {
        console.warn('API not available, trying to create business:', error);
        try {
          // Business doesn't exist, create it
          const createResponse = await api.createBusiness({
            name: userData.profile?.name || 'My Business',
            email: userData.profile?.email || `${walletAddress}@example.com`,
            walletAddress: walletAddress,
            liquidityThreshold: 0.2
          });
          setBusinessId(createResponse.data.id);
          console.log('Business created via API:', createResponse.data.id);
        } catch (createError) {
          console.warn('API create failed, using wallet address as business ID:', createError);
          // If API is not available, use wallet address as business ID
          setBusinessId(walletAddress);
        }
      }
    } catch (error) {
      console.error('Failed to initialize business, using fallback:', error);
      // Fallback to using wallet address as business ID
      const walletAddress = userData.profile.stxAddress?.testnet || userData.profile.stxAddress?.mainnet;
      setBusinessId(walletAddress || 'demo-business');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during hydration
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isUserSignedIn()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <h1 className="text-2xl font-bold">sBTC Treasury Manager</h1>
            <p className="text-muted-foreground">
              Connect your Stacks wallet to access your treasury dashboard
            </p>
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              ← Back to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Treasury Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your sBTC payments and yield strategies
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Connected:</p>
                <p className="font-mono">
                  {(user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet)?.slice(0, 8)}...
                </p>
              </div>
              <Button variant="outline" onClick={signOut}>
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="strategies">Yield Strategies</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Real Data Demo - Actually Works */}
            <RealDataDemo 
              walletAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
            />
            
            {/* Original Treasury Overview - Has Issues */}
            {businessId ? (
              <TreasuryOverview 
                businessId={businessId} 
                businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Loading treasury data...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="strategies" className="space-y-6">
            {businessId ? (
              <YieldStrategyManager 
                businessId={businessId}
                businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
                availableBalance={0.2} // This would come from treasury data
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Loading yield strategies...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {businessId ? (
              <TransactionHistory 
                businessId={businessId}
                businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">Loading transaction history...</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <ContractStatus />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab 
              user={user}
              businessId={businessId}
              businessAddress={user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}