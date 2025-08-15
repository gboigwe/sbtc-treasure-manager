'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Copy, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { getSBTCProtocol, type DepositStatus } from '@/lib/sbtc-protocol';
import { isUserSignedIn, getUserData } from '@/lib/stacks';
import QRCode from 'qrcode';

interface DepositFlowProps {
  onDepositComplete?: (amount: number) => void;
}

export function DepositFlow({ onDepositComplete }: DepositFlowProps) {
  const [step, setStep] = useState<'input' | 'address' | 'waiting' | 'confirmed'>('input');
  const [amount, setAmount] = useState<string>('');
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [depositData, setDepositData] = useState<any>(null);
  const [bitcoinTxid, setBitcoinTxid] = useState<string>('');
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const sbtcProtocol = getSBTCProtocol();
  const user = getUserData();
  const stacksAddress = user?.profile?.stxAddress?.testnet || user?.profile?.stxAddress?.mainnet;

  // Generate deposit address
  const generateDepositAddress = async () => {
    if (!stacksAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For simplicity, we'll use the user's Stacks address as the reclaim key
      // In production, this should be a dedicated Bitcoin public key
      const reclaimKey = stacksAddress;
      
      const depositData = await sbtcProtocol.generateDepositAddress(stacksAddress, reclaimKey);
      setDepositAddress(depositData.address);
      setDepositData(depositData);
      
      // Generate QR code for the deposit address
      await generateQRCode(depositData.address, amount);
      
      setStep('address');
    } catch (error) {
      console.error('Failed to generate deposit address:', error);
      setError('Failed to generate deposit address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code for Bitcoin address
  const generateQRCode = async (address: string, btcAmount: string) => {
    try {
      // Create a Bitcoin URI for better wallet compatibility
      const bitcoinUri = `bitcoin:${address}?amount=${btcAmount}`;
      const qrDataUrl = await QRCode.toDataURL(bitcoinUri, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // Fallback to simple address QR code
      try {
        const fallbackQr = await QRCode.toDataURL(address, {
          width: 256,
          margin: 1
        });
        setQrCodeDataUrl(fallbackQr);
      } catch (fallbackError) {
        console.error('Failed to generate fallback QR code:', fallbackError);
      }
    }
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  // Submit Bitcoin transaction ID
  const submitTransactionId = async () => {
    if (!bitcoinTxid.trim()) {
      setError('Please enter a valid Bitcoin transaction ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Notify Emily about the deposit
      await sbtcProtocol.notifyDeposit(stacksAddress!, bitcoinTxid.trim(), 0, depositData);
      setStep('waiting');
      
      // Start polling for status
      pollDepositStatus();
    } catch (error) {
      console.error('Failed to submit deposit:', error);
      setError('Failed to submit deposit. Please check your transaction ID and try again.');
      setLoading(false);
    }
  };

  // Poll deposit status
  const pollDepositStatus = async () => {
    try {
      const status = await sbtcProtocol.getDepositStatus(bitcoinTxid.trim(), 0);
      setDepositStatus(status);

      if (status.status === 'CONFIRMED') {
        setStep('confirmed');
        onDepositComplete?.(parseFloat(amount));
        setLoading(false);
      } else if (status.status === 'FAILED') {
        setError('Deposit failed. Please contact support.');
        setLoading(false);
      } else {
        // Continue polling
        setTimeout(pollDepositStatus, 30000); // Poll every 30 seconds
      }
    } catch (error) {
      console.error('Failed to check deposit status:', error);
      // Continue polling despite errors
      setTimeout(pollDepositStatus, 60000); // Poll less frequently on errors
    }
  };

  // Reset flow
  const resetFlow = () => {
    setStep('input');
    setAmount('');
    setDepositAddress('');
    setDepositData(null);
    setBitcoinTxid('');
    setDepositStatus(null);
    setError(null);
    setCopied(false);
    setQrCodeDataUrl(null);
  };

  if (!isUserSignedIn()) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please connect your wallet to deposit sBTC</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Deposit BTC → sBTC</span>
          <Badge variant="outline">Step {step === 'input' ? '1' : step === 'address' ? '2' : step === 'waiting' ? '3' : '4'} of 4</Badge>
        </CardTitle>
        <CardDescription>
          Convert your Bitcoin to sBTC for use in the treasury manager
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'input' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (BTC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: 0.001 BTC • You'll receive equivalent sBTC (1:1 ratio)
              </p>
            </div>
            
            <Button 
              onClick={generateDepositAddress} 
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full"
            >
              {loading ? 'Generating...' : 'Generate Deposit Address'}
            </Button>
          </div>
        )}

        {step === 'address' && (
          <div className="space-y-4">
            <div>
              <Label>Send Bitcoin to this address:</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg border-2 border-dashed">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-mono break-all">{depositAddress}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAddress}
                    className="ml-2"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded">
                  {qrCodeDataUrl ? (
                    <>
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Bitcoin deposit address QR code" 
                        className="w-32 h-32 mb-2"
                      />
                      <p className="text-xs text-center text-gray-600">
                        Scan with your Bitcoin wallet
                      </p>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Amount: {amount} BTC
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <QrCode className="h-16 w-16 text-muted-foreground animate-pulse" />
                      <p className="text-sm text-muted-foreground mt-2">Generating QR code...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Send exactly {amount} BTC to this address. 
                Do not send from an exchange - use a wallet you control.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="txid">Bitcoin Transaction ID</Label>
              <Input
                id="txid"
                value={bitcoinTxid}
                onChange={(e) => setBitcoinTxid(e.target.value)}
                placeholder="Enter your Bitcoin transaction ID after sending"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can find this in your Bitcoin wallet after sending the transaction
              </p>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetFlow} className="flex-1">
                Start Over
              </Button>
              <Button 
                onClick={submitTransactionId} 
                disabled={loading || !bitcoinTxid.trim()}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Confirm Deposit'}
              </Button>
            </div>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 animate-pulse" />
              <span>Waiting for confirmations...</span>
            </div>
            
            {depositStatus && (
              <div className="space-y-2">
                <Badge variant={
                  depositStatus.status === 'PENDING' ? 'secondary' :
                  depositStatus.status === 'ACCEPTED' ? 'default' :
                  depositStatus.status === 'CONFIRMED' ? 'default' : 'destructive'
                }>
                  {depositStatus.status}
                </Badge>
                
                {depositStatus.confirmations !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    Confirmations: {depositStatus.confirmations}/3
                  </p>
                )}
              </div>
            )}

            <Alert>
              <AlertDescription>
                Your sBTC will be minted after 1-3 Bitcoin block confirmations. 
                This usually takes 10-30 minutes.
              </AlertDescription>
            </Alert>

            <Button variant="outline" onClick={resetFlow}>
              Start New Deposit
            </Button>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-semibold">Deposit Confirmed!</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {amount} sBTC has been minted to your address. You can now use it in the treasury manager.
            </p>

            <Button onClick={resetFlow} className="w-full">
              Make Another Deposit
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How it works:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Generate a unique Bitcoin deposit address</li>
            <li>Send BTC from your wallet to this address</li>
            <li>Submit the transaction ID to track progress</li>
            <li>Receive sBTC after confirmation</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}