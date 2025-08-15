'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Wallet, CreditCard } from 'lucide-react';
import { isUserSignedIn, connectWallet, getUserData } from '@/lib/stacks';
import { getSBTCProtocol } from '@/lib/sbtc-protocol';

interface CheckoutWidgetProps {
  businessAddress: string;
  businessId: string;
  onSuccess?: (txId: string) => void;
  onError?: (error: string) => void;
}

export function CheckoutWidget({ businessAddress, businessId, onSuccess, onError }: CheckoutWidgetProps) {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [sbtcBalance, setSbtcBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const sbtcProtocol = getSBTCProtocol();
  const user = getUserData();
  const userAddress = user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet;

  // Check wallet connection and load balance
  useEffect(() => {
    setIsClient(true);
    const connected = isUserSignedIn();
    setWalletConnected(connected);
    
    if (connected && userAddress) {
      loadSbtcBalance();
    }
  }, [userAddress]);

  // Load user's sBTC balance
  const loadSbtcBalance = async () => {
    if (!userAddress) return;
    
    setLoadingBalance(true);
    try {
      console.log('Loading sBTC balance for:', userAddress);
      const balance = await sbtcProtocol.getSBTCBalance(userAddress);
      console.log('sBTC balance loaded:', balance);
      setSbtcBalance(balance);
    } catch (error) {
      console.error('Failed to load sBTC balance:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Handle sBTC payment
  const handlePayment = async () => {
    console.log('🚀 Payment button clicked');
    console.log('💰 Current state:', {
      amount,
      sbtcBalance,
      walletConnected,
      userAddress,
      businessAddress
    });
    
    if (!amount || parseFloat(amount) <= 0) {
      console.log('❌ Invalid amount:', amount);
      onError?.('Please enter a valid amount');
      return;
    }

    if (!walletConnected || !userAddress) {
      console.log('❌ Wallet not connected:', { walletConnected, userAddress });
      onError?.('Please connect your wallet first - try refreshing the page');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum > sbtcBalance) {
      console.log('❌ Insufficient balance:', { amount: amountNum, balance: sbtcBalance });
      onError?.(`Insufficient sBTC balance. You have ${sbtcBalance} sBTC but trying to send ${amountNum} sBTC`);
      return;
    }

    console.log('✅ All checks passed - Starting payment process...');
    console.log('📦 Payment details:', {
      amount: amountNum,
      from: userAddress,
      to: businessAddress,
      description: description || 'Coffee shop payment'
    });
    
    setLoading(true);

    try {
      console.log('🔗 Calling transferSBTC...');
      
      // Transfer sBTC using the real protocol
      const transactionId = await sbtcProtocol.transferSBTC(amountNum, businessAddress);
      
      console.log('🎉 sBTC payment successful:', transactionId);
      setTxId(transactionId);
      onSuccess?.(transactionId);
      
      // Refresh balance after payment
      setTimeout(loadSbtcBalance, 2000);
      
    } catch (error) {
      console.error('💥 Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      console.error('💥 Error details:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset payment form
  const resetForm = () => {
    setAmount('');
    setEmail('');
    setDescription('');
    setTxId(null);
    loadSbtcBalance();
  };

  if (!isClient) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="animate-pulse">Loading payment widget...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Pay with sBTC</span>
        </CardTitle>
        <CardDescription>
          Secure Bitcoin payments via sBTC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!walletConnected ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Wallet className="h-8 w-8" />
              <span>Connect your wallet to pay</span>
            </div>
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet
            </Button>
          </div>
        ) : txId ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <span className="font-semibold">Payment Successful!</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Transaction ID:
              </p>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                {txId}
              </p>
            </div>
            <Button onClick={resetForm} variant="outline" className="w-full">
              Make Another Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balance Display */}
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Your sBTC Balance:</span>
              <div className="flex items-center space-x-2">
                {loadingBalance ? (
                  <div className="animate-pulse">Loading...</div>
                ) : (
                  <span className="font-semibold">{sbtcBalance.toFixed(8)} sBTC</span>
                )}
                <Button variant="ghost" size="sm" onClick={loadSbtcBalance}>
                  Refresh
                </Button>
              </div>
            </div>

            {sbtcBalance === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have any sBTC. You need to deposit BTC first to get sBTC for payments.
                </AlertDescription>
              </Alert>
            )}

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (sBTC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  max={sbtcBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.001"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {sbtcBalance.toFixed(8)} sBTC
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this payment for?"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > sbtcBalance}
                className="w-full"
              >
                {loading ? 'Processing Payment...' : `Pay ${amount || '0'} sBTC`}
              </Button>
            </div>

            {/* Business Info */}
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              <p><strong>Paying to:</strong></p>
              <p className="font-mono break-all">{businessAddress}</p>
              <p><strong>Business ID:</strong> {businessId}</p>
            </div>
          </div>
        )}

        {/* Network Badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-xs">
            {process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}