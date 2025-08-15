// Real sBTC Protocol Integration
// Based on official sBTC documentation and Emily API

import { getEmilyClient, type DepositStatus, type WithdrawalStatus } from './emily-api';
import { bitcoinAddressToTuple, generateDepositAddress, type DepositAddress } from './bitcoin-address';

// Official sBTC Contract Addresses
export const SBTC_CONTRACTS = {
  // Real sBTC Protocol Contracts (Testnet)
  SBTC_TOKEN: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token',
  SBTC_DEPOSIT: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-deposit', 
  SBTC_WITHDRAWAL: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-withdrawal',
  SBTC_REGISTRY: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-registry',
  
  // Custom Treasury Contracts (for yield management on top of sBTC)
  TREASURY_MANAGER: 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.treasury-manager',
  YIELD_STRATEGY: 'ST3A5HQKQM3T3BV1MCZ45S6Q729V8355BQ0W0NP2V.yield-strategy'
} as const;

export const SBTC_FUNCTIONS = {
  // SIP-010 sBTC Token Functions
  TOKEN: {
    TRANSFER: 'transfer',
    GET_BALANCE: 'get-balance',
    GET_BALANCE_AVAILABLE: 'get-balance-available',
    GET_BALANCE_LOCKED: 'get-balance-locked',
    GET_TOTAL_SUPPLY: 'get-total-supply'
  },
  
  // sBTC Deposit Functions (BTC → sBTC)
  DEPOSIT: {
    COMPLETE_DEPOSIT: 'complete-deposit-wrapper',
    COMPLETE_DEPOSITS: 'complete-deposits-wrapper'
  },
  
  // sBTC Withdrawal Functions (sBTC → BTC)
  WITHDRAWAL: {
    INITIATE_WITHDRAWAL: 'initiate-withdrawal-request',
    ACCEPT_WITHDRAWAL: 'accept-withdrawal-request',
    REJECT_WITHDRAWAL: 'reject-withdrawal-request'
  },
  
  // sBTC Registry Functions
  REGISTRY: {
    GET_WITHDRAWAL_REQUEST: 'get-withdrawal-request',
    GET_CURRENT_SIGNER_DATA: 'get-current-signer-data',
    GET_CURRENT_AGGREGATE_PUBKEY: 'get-current-aggregate-pubkey'
  }
} as const;

// Emily API (Official sBTC Bridge API)
export const EMILY_API_BASE = 'https://api.sbtc.tech'; // Official sBTC API

export interface SBTCDepositRequest {
  amount: number; // Amount in satoshis
  recipient: string; // Stacks address
  bitcoin_tx_id: string;
  bitcoin_tx_output_index: number;
}

export interface SBTCWithdrawalRequest {
  amount: number; // Amount in satoshis (1 sBTC = 100,000,000 sats)
  recipient: {
    version: string; // Bitcoin address version
    hashbytes: string; // Bitcoin address hash
  };
  max_fee: number; // Maximum fee in satoshis
}

export interface SBTCOperation {
  id: string;
  type: 'deposit' | 'withdrawal';
  status: 'pending' | 'accepted' | 'confirmed' | 'failed';
  amount: number;
  bitcoin_tx_id?: string;
  stacks_tx_id?: string;
  created_at: string;
}

export class SBTCProtocolService {
  private emilyClient = getEmilyClient();
  private network: 'testnet' | 'mainnet';

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    this.emilyClient = getEmilyClient(network);
  }
  
  // Get real sBTC balance for an address
  async getSBTCBalance(address: string): Promise<number> {
    try {
      console.log('Fetching sBTC balance for:', address);
      
      // Use the same method as real-data-demo for consistency
      const response = await fetch(
        `https://api.testnet.hiro.so/extended/v1/address/${address}/balances`
      );

      if (!response.ok) {
        console.warn('sBTC balance fetch failed:', response.status);
        return 0;
      }

      const balanceData = await response.json();
      console.log('Balance data:', balanceData);
      
      // Check for sBTC tokens using the correct contract identifier
      const sbtcTokenKey = `${SBTC_CONTRACTS.SBTC_TOKEN}::sbtc-token`;
      
      if (balanceData.fungible_tokens && balanceData.fungible_tokens[sbtcTokenKey]) {
        const balanceStr = balanceData.fungible_tokens[sbtcTokenKey].balance;
        const balanceSats = parseInt(balanceStr || '0');
        const sbtcBalance = balanceSats / 100000000; // Convert to sBTC
        console.log('Found sBTC balance:', sbtcBalance);
        return sbtcBalance;
      }
      
      console.log('No sBTC balance found for token:', sbtcTokenKey);
      return 0;
    } catch (error) {
      console.error('Error fetching sBTC balance:', error);
      return 0;
    }
  }

  // Transfer sBTC using the official sBTC token contract
  async transferSBTC(amount: number, recipient: string): Promise<string> {
    try {
      console.log('Starting sBTC transfer:', { amount, recipient });
      
      const { openContractCall } = await import('@stacks/connect');
      const { uintCV, standardPrincipalCV, noneCV } = await import('@stacks/transactions');
      const { STACKS_TESTNET } = await import('@stacks/network');

      const [contractAddress, contractName] = SBTC_CONTRACTS.SBTC_TOKEN.split('.');
      const amountSats = Math.floor(amount * 100000000); // Convert sBTC to satoshis

      console.log('Contract call parameters:', {
        contractAddress,
        contractName,
        functionName: SBTC_FUNCTIONS.TOKEN.TRANSFER,
        amountSats,
        recipient,
        network: 'testnet'
      });

      return new Promise((resolve, reject) => {
        try {
          console.log('🔥 About to call openContractCall...');
          
          openContractCall({
            contractAddress,
            contractName,
            functionName: SBTC_FUNCTIONS.TOKEN.TRANSFER,
            functionArgs: [
              uintCV(amountSats),
              standardPrincipalCV(recipient),
              noneCV() // memo
            ],
            network: STACKS_TESTNET,
            appDetails: {
              name: 'sBTC Treasury Manager',
              icon: window.location.origin + '/favicon.ico',
            },
            onFinish: (data) => {
              console.log('✅ Transaction finished:', data);
              resolve(data.txId);
            },
            onCancel: () => {
              console.log('❌ Transaction cancelled by user');
              reject(new Error('Transaction cancelled by user'));
            }
          });
          
          console.log('🚀 openContractCall executed - wallet should pop up now!');
        } catch (error) {
          console.error('💥 Error in openContractCall:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('💥 Error in transferSBTC:', error);
      throw error;
    }
  }

  // Initiate sBTC withdrawal (sBTC → BTC)
  async initiateWithdrawal(amount: number, bitcoinAddress: string, maxFee: number = 10000): Promise<string> {
    const { openContractCall } = await import('@stacks/connect');
    const { uintCV, tupleCV, bufferCV } = await import('@stacks/transactions');
    const { network } = await import('@/lib/stacks');

    const [contractAddress, contractName] = SBTC_CONTRACTS.SBTC_WITHDRAWAL.split('.');
    const amountSats = Math.floor(amount * 100000000);

    // Parse Bitcoin address to get version and hashbytes
    // This is a simplified version - real implementation would need proper Bitcoin address parsing
    const recipient = tupleCV({
      version: bufferCV(Buffer.from([0x00])), // P2PKH version
      hashbytes: bufferCV(Buffer.from(bitcoinAddress.slice(0, 32), 'hex')) // Simplified
    });

    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress,
        contractName,
        functionName: SBTC_FUNCTIONS.WITHDRAWAL.INITIATE_WITHDRAWAL,
        functionArgs: [
          uintCV(amountSats),
          recipient,
          uintCV(maxFee)
        ],
        network,
        onFinish: (data) => resolve(data.txId),
        onCancel: () => reject(new Error('Transaction cancelled'))
      });
    });
  }

  // Get withdrawal request status
  async getWithdrawalRequest(requestId: number) {
    try {
      const [contractAddress, contractName] = SBTC_CONTRACTS.SBTC_REGISTRY.split('.');
      
      const response = await fetch(
        `https://api.testnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${SBTC_FUNCTIONS.REGISTRY.GET_WITHDRAWAL_REQUEST}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: contractAddress,
            arguments: [`u${requestId}`]
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.result;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching withdrawal request:', error);
      return null;
    }
  }

  // Get current sBTC signer data
  async getCurrentSignerData() {
    try {
      const [contractAddress, contractName] = SBTC_CONTRACTS.SBTC_REGISTRY.split('.');
      
      const response = await fetch(
        `https://api.testnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/${SBTC_FUNCTIONS.REGISTRY.GET_CURRENT_SIGNER_DATA}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: contractAddress,
            arguments: []
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.result;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching signer data:', error);
      return null;
    }
  }

  // Emily API Integration - Track deposit/withdrawal operations
  async trackOperation(operationId: string): Promise<SBTCOperation | null> {
    try {
      const response = await fetch(`${EMILY_API_BASE}/deposits/${operationId}`);
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch (error) {
      console.error('Error tracking operation:', error);
      return null;
    }
  }

  // Convert satoshis to sBTC
  static satsToSBTC(sats: number): number {
    return sats / 100000000;
  }

  // Convert sBTC to satoshis  
  static sbtcToSats(sbtc: number): number {
    return Math.floor(sbtc * 100000000);
  }

  // Get sBTC bridge URL for deposits
  static getBridgeURL(): string {
    return 'https://app.stacks.co';
  }

  // Get sBTC rewards program URL
  static getRewardsURL(): string {
    return 'https://bitcoinismore.org';
  }

  // Generate a deposit address for BTC → sBTC conversion
  async generateDepositAddress(stacksAddress: string, reclaimPublicKey: string): Promise<DepositAddress> {
    try {
      const signersPublicKey = await this.emilyClient.getSignersPublicKey();
      return generateDepositAddress(stacksAddress, signersPublicKey, reclaimPublicKey, this.network);
    } catch (error) {
      console.error('Failed to generate deposit address:', error);
      throw new Error('Failed to generate deposit address');
    }
  }

  // Notify Emily about a new deposit
  async notifyDeposit(stacksAddress: string, bitcoinTxid: string, bitcoinTxOutputIndex: number, depositAddress: DepositAddress): Promise<void> {
    try {
      await this.emilyClient.notifyDeposit({
        stacksAddress,
        bitcoinTxid,
        bitcoinTxOutputIndex,
        reclaimScript: depositAddress.reclaimScript,
        depositScript: depositAddress.redeemScript,
      });
    } catch (error) {
      console.error('Failed to notify Emily about deposit:', error);
      throw error;
    }
  }

  // Get deposit status from Emily
  async getDepositStatus(txid: string, vout: number = 0): Promise<DepositStatus> {
    return await this.emilyClient.getDepositStatus(txid, vout);
  }

  // Get withdrawal status from Emily
  async getWithdrawalStatus(requestId: string): Promise<WithdrawalStatus> {
    return await this.emilyClient.getWithdrawalStatus(requestId);
  }

  // Get all deposits for an address
  async getAddressDeposits(stacksAddress: string): Promise<DepositStatus[]> {
    return await this.emilyClient.getAddressDeposits(stacksAddress);
  }

  // Get all withdrawals for an address
  async getAddressWithdrawals(stacksAddress: string): Promise<WithdrawalStatus[]> {
    return await this.emilyClient.getAddressWithdrawals(stacksAddress);
  }

  // Encode Bitcoin address for withdrawal contract
  encodeBitcoinAddress(address: string) {
    return bitcoinAddressToTuple(address, this.network);
  }

  // Check if Emily API is available
  async checkEmilyHealth(): Promise<boolean> {
    return await this.emilyClient.checkHealth();
  }
}

// Export service instances
export const sbtcProtocolTestnet = new SBTCProtocolService('testnet');
export const sbtcProtocolMainnet = new SBTCProtocolService('mainnet');

// Helper to get the right service based on environment
export function getSBTCProtocol(network?: 'testnet' | 'mainnet'): SBTCProtocolService {
  const targetNetwork = network || (process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? 'mainnet' : 'testnet');
  return targetNetwork === 'mainnet' ? sbtcProtocolMainnet : sbtcProtocolTestnet;
}