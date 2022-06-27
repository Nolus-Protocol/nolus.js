import { LeaseApply, LeaserConfig, LoanInfo, LppBalance } from '../types';
import {
    closeLeaseMsg,
    getCurrentOpenLeasesMsg,
    getLeaserConfigMsg,
    getLeaseStatusMsg,
    getLoanInformationMsg,
    getLppBalanceMsg,
    makeLeaseApplyMsg,
    openLeaseMsg,
    repayLeaseMsg,
    setLeaserConfigMsg,
} from '../messages';
import { NolusWallet } from '../../wallet';
import { StdFee } from '@cosmjs/stargate';
import { Coin } from '@cosmjs/proto-signing';
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient';
import { LeaseStatus } from '../types/LeaseStatus';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export class Lease {
    private cosmWasmClient!: CosmWasmClient;

    constructor(cosmWasmClient: CosmWasmClient) {
        this.cosmWasmClient = cosmWasmClient;
    }

    public async makeLeaseApply(contractAddress: string, amount: string, denom: string): Promise<LeaseApply> {
        return await this.cosmWasmClient.queryContractSmart(contractAddress, makeLeaseApplyMsg(amount, denom));
    }

    public async getCurrentOpenLeases(contractAddress: string, ownerAddress: string): Promise<string[]> {
        return await this.cosmWasmClient.queryContractSmart(contractAddress, getCurrentOpenLeasesMsg(ownerAddress));
    }

    public async getLeaseStatus(contractAddress: string): Promise<LeaseStatus> {
        return await this.cosmWasmClient.queryContractSmart(contractAddress, getLeaseStatusMsg());
    }

    public async getLeaserConfig(contractAddress: string): Promise<LeaserConfig> {
        return await this.cosmWasmClient.queryContractSmart(contractAddress, getLeaserConfigMsg());
    }

    public async getLoanInformation(contractAddress: string, leaseAddress: string): Promise<LoanInfo> {
        return await this.cosmWasmClient.queryContractSmart(contractAddress, getLoanInformationMsg(leaseAddress));
    }

    public async getLppBalance(contractAddress: string): Promise<LppBalance> {
        return await this.cosmWasmClient.queryContractSmart(contractAddress, getLppBalanceMsg());
    }

    public async openLease(contractAddress: string, nolusWallet: NolusWallet, leaseDenom: string, fee: StdFee | 'auto' | number, fundCoin?: Coin[]): Promise<ExecuteResult> {
        return nolusWallet.executeContract(contractAddress, openLeaseMsg(leaseDenom), fee, undefined, fundCoin);
    }

    public async repayLease(contractAddress: string, nolusWallet: NolusWallet, fee: StdFee | 'auto' | number, fundCoin?: Coin[]): Promise<ExecuteResult> {
        return nolusWallet.executeContract(contractAddress, repayLeaseMsg(), fee, undefined, fundCoin);
    }

    public async closeLease(contractAddress: string, nolusWallet: NolusWallet, fee: StdFee | 'auto' | number, fundCoin?: Coin[]): Promise<ExecuteResult> {
        return nolusWallet.executeContract(contractAddress, closeLeaseMsg(), fee, undefined, fundCoin);
    }

    public async setLeaserConfig(contractAddress: string, nolusWallet: NolusWallet, leaserConfig: LeaserConfig, fee: StdFee | 'auto' | number, fundCoin?: Coin[]): Promise<ExecuteResult> {
        return nolusWallet.executeContract(contractAddress, setLeaserConfigMsg(leaserConfig), fee, undefined, fundCoin);
    }
}
