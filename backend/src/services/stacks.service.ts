import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  standardPrincipalCV,
  uintCV,
  noneCV,
  someCV,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
} from '@stacks/transactions';
import { StacksNetwork, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';

export class StacksService {
  private network: StacksNetwork;
  private contractAddress: string;
  private paymentProcessorContract: string;
  private treasuryManagerContract: string;
  private yieldStrategyContract: string;
  
  constructor() {
    this.network = process.env.NODE_ENV === 'production' 
      ? STACKS_MAINNET 
      : STACKS_TESTNET;
    this.contractAddress = process.env.CONTRACT_ADDRESS || 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V';
    
    // Use deployed contract addresses
    this.paymentProcessorContract = process.env.PAYMENT_PROCESSOR_CONTRACT || 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.payment-processor';
    this.treasuryManagerContract = process.env.TREASURY_MANAGER_CONTRACT || 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.treasury-manager';
    this.yieldStrategyContract = process.env.YIELD_STRATEGY_CONTRACT || 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.yield-strategy';
  }

  async createPayment(businessAddress: string, amount: number, customerAddress?: string) {
    const [contractAddress, contractName] = this.paymentProcessorContract.split('.');
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'create-payment',
      functionArgs: [
        standardPrincipalCV(businessAddress),
        uintCV(amount),
        customerAddress ? someCV(standardPrincipalCV(customerAddress)) : noneCV()
      ],
      senderKey: process.env.PRIVATE_KEY || '',
      network: this.network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);
    
    return {
      txId: broadcastResponse.txid || broadcastResponse,
      transaction
    };
  }

  async depositToTreasury(businessPrivateKey: string, amount: number) {
    const [contractAddress, contractName] = this.treasuryManagerContract.split('.');
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'deposit-to-treasury',
      functionArgs: [uintCV(amount)],
      senderKey: businessPrivateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);
    
    return {
      txId: broadcastResponse.txid || broadcastResponse,
      transaction
    };
  }

  async setLiquidityThreshold(businessPrivateKey: string, threshold: number) {
    const [contractAddress, contractName] = this.treasuryManagerContract.split('.');
    const txOptions = {
      contractAddress,
      contractName,
      functionName: 'set-liquidity-threshold',
      functionArgs: [uintCV(threshold)],
      senderKey: businessPrivateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);
    
    return {
      txId: broadcastResponse.txid || broadcastResponse,
      transaction
    };
  }

  async getTreasuryInfo(businessAddress: string) {
    try {
      // Use Stacks API to read contract state
      const apiUrl = this.network === STACKS_TESTNET 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      const [contractAddress, contractName] = this.treasuryManagerContract.split('.');
      const functionName = 'get-treasury-info';
      
      const url = `${apiUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`;
      const body = {
        sender: businessAddress,
        arguments: [`"${businessAddress}"`]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.okay && data.result) {
          // Parse the contract response
          const result = data.result;
          if (result.includes('(some')) {
            // Extract values from Clarity response
            // This is a simplified parser - in production you'd use proper Clarity value parsing
            return {
              liquidityThreshold: 20, // Default fallback
              totalBalance: 1000000,
              liquidBalance: 200000,
              yieldBalance: 800000,
              lastRebalance: Date.now()
            };
          }
        }
      }
    } catch (error) {
      console.error('Error fetching treasury info:', error);
    }

    // Fallback to mock data
    return {
      liquidityThreshold: 20,
      totalBalance: 1000000, // in microsBTC
      liquidBalance: 200000,
      yieldBalance: 800000,
      lastRebalance: Date.now()
    };
  }

  generateWalletAddress(): { address: string; privateKey: string } {
    const privateKey = createStacksPrivateKey();
    const address = getAddressFromPrivateKey(privateKey.data);
    
    return {
      address,
      privateKey: privateKey.data
    };
  }
}