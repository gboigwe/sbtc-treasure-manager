'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { showConnect } from '@stacks/connect';
import { STACKS_TESTNET } from '@stacks/network';
import { 
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  standardPrincipalCV,
  uintCV 
} from '@stacks/transactions';
import { userSession, connectWallet, isUserSignedIn } from '@/lib/stacks';
import { blockchainService } from '@/lib/blockchain';

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

  // Check wallet connection on mount
  useEffect(() => {
    setIsClient(true);
    setWalletConnected(isUserSignedIn());
  }, []);

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Convert amount to microunits (1 sBTC = 1,000,000 microsBTC)
      const amountInMicro = Math.floor(parseFloat(amount) * 1000000);

      // Check if user is signed in
      if (!userSession.isUserSignedIn()) {
        onError?.('Please connect your wallet first');
        return;
      }

      console.log('Creating payment on blockchain...', {
        businessAddress,
        amount: amountInMicro,
        description
      });

      // Create actual blockchain transaction - no fallbacks, real only
      if (!isUserSignedIn()) {
        throw new Error('Please connect your Stacks wallet to make payments');
      }

      const result = await blockchainService.createPayment(businessAddress, amountInMicro);
      console.log('✅ Real blockchain transaction created:', result.txId);
      
      if (!result.txId || result.txId.length !== 66) {
        throw new Error('Invalid transaction ID received from blockchain');
      }
      
      setTxId(result.txId);
      onSuccess?.(result.txId);
      
      // Reset form
      setAmount('');
      setEmail('');
      setDescription('');
      
    } catch (error) {
      console.error('Payment failed:', error);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (txId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been submitted to the Stacks blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Transaction ID</Label>
            <div className="p-2 bg-muted rounded-md text-sm font-mono break-all">
              {txId}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Contract: ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.payment-processor</p>
            <p>• Network: Stacks Testnet</p>
            <p>• Status: {txId.length === 66 ? 'Pending confirmation' : 'Demo Mode'}</p>
            {txId.length === 66 ? (
              <>
                <p>• Expected confirmation: 2-5 minutes</p>
                <p>• <a 
                    href={`https://explorer.stacks.co/txid/${txId}?chain=testnet`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on Explorer →
                  </a>
                </p>
              </>
            ) : (
              <>
                <p>• This is a demo transaction (wallet not connected or transaction failed)</p>
                <p>• Connect your Stacks wallet for real blockchain transactions</p>
                <p>• <span className="text-yellow-600">Demo Transaction ID</span></p>
              </>
            )}
          </div>

          <Button 
            onClick={() => {setTxId(null); setAmount(''); setEmail(''); setDescription('')}} 
            variant="outline" 
            className="w-full"
          >
            Make Another Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Pay with sBTC</CardTitle>
        <CardDescription>
          Secure payment processing with Bitcoin-backed sBTC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (sBTC)</Label>
          <Input
            id="amount"
            type="number"
            step="0.00001"
            placeholder="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          {amount && (
            <p className="text-sm text-muted-foreground">
              ≈ ${(parseFloat(amount) * 65000).toLocaleString()} USD
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="customer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Payment for..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={3}
          />
        </div>

        {!isClient ? (
          <Button disabled className="w-full">
            Loading...
          </Button>
        ) : !walletConnected ? (
          <Button 
            onClick={() => {
              connectWallet();
              // Refresh connection status after wallet connection
              setTimeout(() => setWalletConnected(isUserSignedIn()), 1000);
            }} 
            className="w-full"
          >
            Connect Stacks Wallet
          </Button>
        ) : (
          <Button 
            onClick={handlePayment} 
            disabled={loading || !amount} 
            className="w-full"
          >
            {loading ? 'Processing...' : `Pay ${amount || '0'} sBTC`}
          </Button>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary" className="text-xs">Powered by Stacks</Badge>
          <Badge variant="secondary" className="text-xs">Bitcoin Finality</Badge>
          <Badge variant="secondary" className="text-xs">Instant Confirmation</Badge>
        </div>
      </CardContent>
    </Card>
  );
}