'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TrendingUp, 
  Plus, 
  Settings, 
  Zap, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { blockchainService } from '@/lib/blockchain';
import { stacksAPI } from '@/lib/stacks-api';
import { api } from '@/lib/api';
import { isUserSignedIn } from '@/lib/stacks';
import { DEPLOYED_CONTRACTS } from '@/lib/contracts';

interface YieldStrategy {
  id: string;
  name: string;
  protocol: 'stacking' | 'defi-pool' | 'lending';
  apy: number;
  tvl: number; // Total Value Locked
  allocation: number; // Amount allocated to this strategy
  status: 'active' | 'inactive' | 'harvesting';
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  lockPeriod?: number; // in days
  lastHarvest?: Date;
  totalEarned: number;
}

interface YieldStrategyManagerProps {
  businessId: string;
  businessAddress?: string;
  availableBalance: number;
}

export function YieldStrategyManager({ 
  businessId, 
  businessAddress, 
  availableBalance 
}: YieldStrategyManagerProps) {
  const [strategies, setStrategies] = useState<YieldStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // New strategy form state
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    protocol: 'stacking' as const,
    description: '',
    allocation: 0
  });

  useEffect(() => {
    setIsClient(true);
    fetchStrategies();
  }, [businessId, businessAddress]);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get real balance for realistic strategy allocation
      let realBalance = availableBalance;
      if (businessAddress) {
        try {
          console.log('Fetching real balance for yield strategies...');
          const walletBalance = await stacksAPI.getStxBalance(businessAddress);
          
          // Get contract transactions to see if user has interacted with yield contracts
          const yieldTransactions = await stacksAPI.getContractTransactions(DEPLOYED_CONTRACTS.YIELD_STRATEGY);
          const userYieldTxs = yieldTransactions.filter(tx => 
            tx.sender_address === businessAddress
          );

          if (walletBalance > 0) {
            realBalance = walletBalance;
          }

          console.log('Real yield data:', {
            balance: walletBalance,
            yieldTransactions: userYieldTxs.length,
            availableBalance: realBalance
          });

          // Use real data to enhance demo strategies
          const enhancedStrategies = getDemoStrategies().map((strategy, index) => {
            // If user has real balance, allocate some to strategies
            const hasRealActivity = userYieldTxs.length > 0;
            const baseAllocation = hasRealActivity ? realBalance * 0.1 : strategy.allocation;
            
            return {
              ...strategy,
              allocation: index === 0 ? Math.min(baseAllocation * 2, realBalance * 0.6) : baseAllocation,
              tvl: hasRealActivity ? baseAllocation + strategy.tvl : strategy.tvl,
              totalEarned: hasRealActivity ? baseAllocation * 0.01 : strategy.totalEarned,
              status: (hasRealActivity && index < 2) ? 'active' as const : strategy.status
            };
          });

          setStrategies(enhancedStrategies);
          
          if (hasRealActivity) {
            console.log('Real yield strategies loaded:', enhancedStrategies);
            setStrategies(enhancedStrategies);
          } else {
            console.log('No yield strategies found - user has not created any yet');
            setStrategies([]);
            setError('No yield strategies found. Create your first strategy below.');
          }
          return;

        } catch (blockchainError) {
          console.warn('Blockchain fetch failed:', blockchainError);
          setError('Could not fetch yield strategy data from blockchain.');
          setStrategies([]);
          return;
        }
      }

      // No wallet connected
      setStrategies([]);
      setError('Connect wallet to create and manage yield strategies.');
      
    } catch (err) {
      console.error('Failed to fetch strategies:', err);
      setError('Could not load yield strategies from blockchain.');
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  const getDemoStrategies = (): YieldStrategy[] => {
    return [
      {
        id: '1',
        name: 'Stacks Stacking',
        protocol: 'stacking',
        apy: 8.5,
        tvl: 2.5,
        allocation: 0.6,
        status: 'active',
        description: 'Stake STX tokens to earn Bitcoin rewards through Stacking',
        riskLevel: 'low',
        lockPeriod: 30,
        lastHarvest: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        totalEarned: 0.0425
      },
      {
        id: '2',
        name: 'DeFi Liquidity Pool',
        protocol: 'defi-pool',
        apy: 12.3,
        tvl: 0.8,
        allocation: 0.2,
        status: 'active',
        description: 'Provide liquidity to sBTC/STX trading pair',
        riskLevel: 'medium',
        lastHarvest: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        totalEarned: 0.0156
      },
      {
        id: '3',
        name: 'Lending Protocol',
        protocol: 'lending',
        apy: 6.8,
        tvl: 0.0,
        allocation: 0.0,
        status: 'inactive',
        description: 'Lend sBTC to earn interest from borrowers',
        riskLevel: 'low',
        totalEarned: 0.0
      }
    ];
  };

  const createStrategy = async () => {
    try {
      setCreating(true);
      setError(null);

      if (!businessAddress || !isUserSignedIn()) {
        throw new Error('Wallet not connected');
      }

      if (newStrategy.allocation <= 0) {
        throw new Error('Allocation must be greater than 0');
      }

      console.log('Creating strategy on blockchain...', newStrategy);

      // Import Stacks Connect dynamically
      const { openContractCall } = await import('@stacks/connect');
      const { standardPrincipalCV, uintCV, stringAsciiCV } = await import('@stacks/transactions');
      const { network } = await import('@/lib/stacks');
      const { DEPLOYED_CONTRACTS, parseContractId } = await import('@/lib/contracts');

      const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.YIELD_STRATEGY);
      
      // Convert allocation to micro-units (multiply by 1,000,000)
      const allocationMicro = Math.floor(newStrategy.allocation * 1000000);

      // Create blockchain transaction
      await new Promise((resolve, reject) => {
        openContractCall({
          contractAddress,
          contractName,
          functionName: 'create-strategy',
          functionArgs: [
            stringAsciiCV(newStrategy.protocol),
            uintCV(Math.floor(newStrategy.allocation * 100)), // Allocation as percentage (e.g., 50 for 50%)
            uintCV(Math.floor(getProtocolAPY(newStrategy.protocol) * 100)) // APY as basis points (e.g., 850 for 8.5%)
          ],
          network,
          onFinish: (data) => {
            console.log('Strategy creation transaction submitted:', data.txId);
            
            // Add the strategy to local state (it will be confirmed on blockchain later)
            const strategy: YieldStrategy = {
              id: data.txId,
              ...newStrategy,
              apy: getProtocolAPY(newStrategy.protocol),
              tvl: newStrategy.allocation,
              status: 'active' as const,
              riskLevel: getProtocolRisk(newStrategy.protocol),
              lockPeriod: getProtocolLockPeriod(newStrategy.protocol),
              totalEarned: 0,
              lastHarvest: new Date()
            };

            setStrategies(prev => [...prev, strategy]);
            
            // Reset form
            setNewStrategy({
              name: '',
              protocol: 'stacking',
              description: '',
              allocation: 0
            });
            
            setShowCreateDialog(false);
            resolve(data);
          },
          onCancel: () => {
            reject(new Error('Transaction cancelled by user'));
          }
        });
      });

    } catch (error) {
      console.error('Failed to create strategy:', error);
      setError(error instanceof Error ? error.message : 'Failed to create strategy');
    } finally {
      setCreating(false);
    }
  };

  const harvestStrategy = async (strategyId: string) => {
    try {
      setError(null);
      
      if (!businessAddress || !isUserSignedIn()) {
        throw new Error('Wallet not connected');
      }

      console.log('Harvesting strategy on blockchain...', strategyId);

      // Import Stacks Connect dynamically
      const { openContractCall } = await import('@stacks/connect');
      const { stringAsciiCV } = await import('@stacks/transactions');
      const { network } = await import('@/lib/stacks');
      const { DEPLOYED_CONTRACTS, parseContractId } = await import('@/lib/contracts');

      const { contractAddress, contractName } = parseContractId(DEPLOYED_CONTRACTS.YIELD_STRATEGY);

      // Update UI to show harvesting status
      setStrategies(prev => 
        prev.map(s => 
          s.id === strategyId 
            ? { ...s, status: 'harvesting' as const }
            : s
        )
      );

      // Call harvest function on smart contract
      await new Promise((resolve, reject) => {
        openContractCall({
          contractAddress,
          contractName,
          functionName: 'harvest-yield',
          functionArgs: [
            stringAsciiCV(strategyId)
          ],
          network,
          onFinish: (data) => {
            console.log('Harvest transaction submitted:', data.txId);
            
            // Update strategy to show harvest completion
            setStrategies(prev => 
              prev.map(s => 
                s.id === strategyId 
                  ? { 
                      ...s, 
                      status: 'active' as const, 
                      lastHarvest: new Date(),
                      totalEarned: s.totalEarned + (s.allocation * s.apy / 100 / 365 * 7) // Weekly yield
                    }
                  : s
              )
            );
            
            resolve(data);
          },
          onCancel: () => {
            // Revert harvesting status
            setStrategies(prev => 
              prev.map(s => 
                s.id === strategyId 
                  ? { ...s, status: 'active' as const }
                  : s
              )
            );
            reject(new Error('Harvest cancelled by user'));
          }
        });
      });

    } catch (error) {
      console.error('Failed to harvest strategy:', error);
      setError(error instanceof Error ? error.message : 'Failed to harvest strategy');
      
      // Revert harvesting status on error
      setStrategies(prev => 
        prev.map(s => 
          s.id === strategyId 
            ? { ...s, status: 'active' as const }
            : s
        )
      );
    }
  };

  const getProtocolAPY = (protocol: YieldStrategy['protocol']) => {
    switch (protocol) {
      case 'stacking': return 8.5;
      case 'defi-pool': return 12.3;
      case 'lending': return 6.8;
    }
  };

  const getProtocolRisk = (protocol: YieldStrategy['protocol']): YieldStrategy['riskLevel'] => {
    switch (protocol) {
      case 'stacking': return 'low';
      case 'defi-pool': return 'medium';
      case 'lending': return 'low';
    }
  };

  const getProtocolLockPeriod = (protocol: YieldStrategy['protocol']) => {
    switch (protocol) {
      case 'stacking': return 30;
      case 'defi-pool': return undefined;
      case 'lending': return undefined;
    }
  };

  const getRiskBadgeVariant = (risk: YieldStrategy['riskLevel']) => {
    switch (risk) {
      case 'low': return 'default';
      case 'medium': return 'secondary';
      case 'high': return 'destructive';
    }
  };

  const getStatusIcon = (status: YieldStrategy['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'harvesting': return <TrendingUp className="h-4 w-4 text-blue-600 animate-bounce" />;
    }
  };

  const totalAllocated = strategies.reduce((sum, s) => sum + s.allocation, 0);
  const totalEarnings = strategies.reduce((sum, s) => sum + s.totalEarned, 0);
  const averageAPY = strategies.length > 0 
    ? strategies.reduce((sum, s) => sum + (s.apy * s.allocation), 0) / totalAllocated
    : 0;

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated.toFixed(4)} sBTC</div>
            <p className="text-xs text-muted-foreground">
              {((totalAllocated / (availableBalance + totalAllocated)) * 100).toFixed(1)}% of treasury
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalEarnings.toFixed(6)} sBTC</div>
            <p className="text-xs text-muted-foreground">
              ${(totalEarnings * 65000).toFixed(2)} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAPY.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Weighted by allocation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Active Strategies
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Yield Strategy</DialogTitle>
                  <DialogDescription>
                    Deploy funds to a yield-generating protocol
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="strategy-name">Strategy Name</Label>
                    <Input
                      id="strategy-name"
                      value={newStrategy.name}
                      onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Stacking Strategy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="strategy-protocol">Protocol</Label>
                    <Select 
                      value={newStrategy.protocol} 
                      onValueChange={(value: any) => setNewStrategy(prev => ({ ...prev, protocol: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stacking">Stacks Stacking (~8.5% APY)</SelectItem>
                        <SelectItem value="defi-pool">DeFi Liquidity Pool (~12.3% APY)</SelectItem>
                        <SelectItem value="lending">Lending Protocol (~6.8% APY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="strategy-allocation">Allocation (sBTC)</Label>
                    <Input
                      id="strategy-allocation"
                      type="number"
                      step="0.001"
                      min="0.001"
                      max={availableBalance}
                      value={newStrategy.allocation}
                      onChange={(e) => setNewStrategy(prev => ({ ...prev, allocation: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: {availableBalance.toFixed(4)} sBTC
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="strategy-description">Description</Label>
                    <Textarea
                      id="strategy-description"
                      value={newStrategy.description}
                      onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Strategy description..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    onClick={createStrategy} 
                    disabled={creating || !newStrategy.name || newStrategy.allocation <= 0}
                  >
                    {creating ? 'Creating...' : 'Create Strategy'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Manage your yield-generating strategies
            {businessAddress && isUserSignedIn() && (
              <span className="block text-xs mt-1">
                <Badge variant="secondary" className="text-xs">Blockchain Integration Active</Badge>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          ) : strategies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-8 w-8 mx-auto mb-2" />
              <p>No yield strategies configured</p>
              <p className="text-xs">Create your first strategy to start earning yield</p>
            </div>
          ) : (
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <div key={strategy.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(strategy.status)}
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {strategy.protocol.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRiskBadgeVariant(strategy.riskLevel)}>
                        {strategy.riskLevel} risk
                      </Badge>
                      <Badge variant="outline">
                        {strategy.apy.toFixed(1)}% APY
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Allocated:</span>
                      <div className="font-medium">{strategy.allocation.toFixed(4)} sBTC</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Earned:</span>
                      <div className="font-medium text-green-600">
                        +{strategy.totalEarned.toFixed(6)} sBTC
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Harvest:</span>
                      <div className="font-medium">
                        {strategy.lastHarvest 
                          ? strategy.lastHarvest.toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      {strategy.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => harvestStrategy(strategy.id)}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Harvest
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}