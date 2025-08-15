'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WalletTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testWallet = async () => {
    setTesting(true);
    setResult('');
    
    try {
      console.log('🔍 Testing wallet popup...');
      
      const { openContractCall } = await import('@stacks/connect');
      const { STACKS_TESTNET } = await import('@stacks/network');
      
      // Simple test with well-known contract
      openContractCall({
        contractAddress: 'SP000000000000000000002Q6VF78',
        contractName: 'pox',
        functionName: 'get-pox-info',
        functionArgs: [],
        network: STACKS_TESTNET,
        appDetails: {
          name: 'sBTC Treasury Test',
          icon: `${window.location.origin}/favicon.ico`,
        },
        onFinish: (data) => {
          console.log('✅ Wallet test successful!', data);
          setResult(`✅ SUCCESS! Wallet popup worked. TX: ${data.txId}`);
          setTesting(false);
        },
        onCancel: () => {
          console.log('❌ User cancelled transaction');
          setResult('❌ Cancelled by user (but popup appeared!)');
          setTesting(false);
        }
      });

      // Timeout if no response
      setTimeout(() => {
        if (testing) {
          setResult('⏰ No wallet popup appeared - check popup blockers');
          setTesting(false);
        }
      }, 5000);

    } catch (error) {
      console.error('Test failed:', error);
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔧 Wallet Test</CardTitle>
        <CardDescription>
          Test if wallet popup appears
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testWallet}
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Test Wallet Popup'}
        </Button>
        
        {result && (
          <div className="p-3 bg-muted rounded text-sm">
            {result}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>This will test if your wallet extension responds to contract calls.</p>
          <p>If no popup appears:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check popup blockers</li>
            <li>Make sure Leather/Xverse is installed</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}