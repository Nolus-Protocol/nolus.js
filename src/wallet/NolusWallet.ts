import stargate, { DeliverTxResponse, isDeliverTxFailure, StdFee, calculateFee } from '@cosmjs/stargate';
import { SigningCosmWasmClient, SigningCosmWasmClientOptions } from '@cosmjs/cosmwasm-stargate';
import { Coin, EncodeObject, OfflineSigner } from '@cosmjs/proto-signing';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { ExecuteResult } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient';
import { toUtf8, toHex } from '@cosmjs/encoding';
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { ContractData } from '../contracts/types/ContractData';
import { encodeSecp256k1Pubkey } from '@cosmjs/amino';
import { ChainConstants } from '../constants';
import { sha256 } from '@cosmjs/crypto';

/**
 * Nolus Wallet service class.
 *
 * Usage:
 *
 * ```ts
 * import { nolusOfflineSigner } from '@nolus/nolusjs/build/wallet/NolusWalletFactory';
 *
 * const nolusWallet = await nolusOfflineSigner(offlineSigner);
 * nolusWallet.useAccount();
 * ```
 */
export class NolusWallet extends SigningCosmWasmClient {
    address?: string;
    pubKey?: Uint8Array;
    algo?: string;

    protected offlineSigner: OfflineSigner;

    constructor(tmClient: Tendermint34Client | undefined, signer: OfflineSigner, options: SigningCosmWasmClientOptions) {
        super(tmClient, signer, options);
        this.offlineSigner = signer;
    }

    public async useAccount(): Promise<boolean> {
        const accounts = await this.offlineSigner.getAccounts();
        if (accounts.length === 0) {
            throw new Error('Missing account');
        }

        this.address = accounts[0].address;
        this.pubKey = accounts[0].pubkey;
        this.algo = accounts[0].algo;

        return true;
    }

    public async transferAmount(receiverAddress: string, amount: Coin[], fee: StdFee | 'auto' | number, memo?: string): Promise<DeliverTxResponse> {
        if (!this.address) {
            throw new Error('Sender address is missing');
        }
        return this.sendTokens(this.address, receiverAddress, amount, fee, memo);
    }

    public async executeContract(contractAddress: string, msg: Record<string, any>, fee: StdFee | 'auto' | number, memo?: string, funds?: Coin[]): Promise<ExecuteResult> {
        if (!this.address) {
            throw new Error('Sender address is missing');
        }
        return this.execute(this.address, contractAddress, msg, fee, memo, funds);
    }

    public async executeContractSubMsg(contractData: ContractData[], fee: StdFee | 'auto' | number, memo?: string, funds?: Coin[]): Promise<ExecuteResult> {
        if (!this.address) {
            throw new Error('Sender address is missing');
        }

        const executeContractMsg: EncodeObject[] = contractData.map((contractData) => {
            return {
                typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
                value: MsgExecuteContract.fromPartial({
                    sender: this.address,
                    contract: contractData.contractAddress,
                    msg: toUtf8(JSON.stringify(contractData.msg)),
                    funds: [...(funds || [])],
                }),
            };
        });
        const result = await this.signAndBroadcast(this.address, executeContractMsg, fee, memo);
        if (isDeliverTxFailure(result)) {
            throw new Error(this.createDeliverTxResponseErrorMessage(result));
        }
        return {
            logs: stargate.logs.parseRawLog(result.rawLog),
            height: result.height,
            transactionHash: result.transactionHash,
            gasWanted: result.gasWanted,
            gasUsed: result.gasUsed,
            events: []
        };
    }

    /**
     * 
     * const amount = coin(1, 'unls')
     * const {
     *     txHash,
     *     txBytes,
     *     usedFee
     * } = await wallet.transferAmountTransactionData('nolusaddress', [amount]);
     * const item = await wallet.broadcastTx(txBytes);
     *
     */
    
    public async transferAmountTransactionData(toAddress: string, amount: Coin[], memo: string = ''){
        const pubkey = encodeSecp256k1Pubkey(this.pubKey as Uint8Array);
        const msg = MsgSend.fromPartial({
            fromAddress: this.address,
            toAddress,
            amount,
        });

        const msgAny = {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: msg,
        };

        const sequence = await this.sequence();
        const { gasInfo } = await this.forceGetQueryClient().tx.simulate([this.registry.encodeAsAny(msgAny)], memo, pubkey, sequence);

        const gas = Math.round(gasInfo?.gasUsed.toNumber() as number * ChainConstants.MULTIPLIER);
        const usedFee = calculateFee(gas, ChainConstants.GAS_PRICE);
        const txRaw = await this.sign(this.address as string, [msgAny], usedFee, memo);

        const txBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());
        const txHash = toHex(sha256(txBytes));

        return {
            txHash,
            txBytes,
            usedFee
        }
    }

    /**
     * 
     * const amount = coin(1, 'ibc/7FBDBEEEBA9C50C4BCDF7BF438EAB99E64360833D240B32655C96E319559E911')
     * const cosmWasmClient = await NolusClient.getInstance().getCosmWasmClient();
     * const lppClient = new Lpp(
     *   cosmWasmClient,
     *   contractAddress
     * );
     *
     * const {
     *     txHash,
     *     txBytes,
     *     usedFee
     * } = await lppClient.depositData(wallet, [amount]);
     * const item = await wallet.broadcastTx(txBytes);
     */
    public async executeContractData(contract: string, msgData: Record<string, any>, memo: string = '', funds: Coin[] = []) {
        const pubkey = encodeSecp256k1Pubkey(this.pubKey as Uint8Array);
        const msg = MsgExecuteContract.fromPartial({
            sender: this.address,
            contract,
            msg: toUtf8(JSON.stringify(msgData)),
            funds,
        });

        const msgAny = {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: msg,
        };

        const sequence = await this.sequence();
        const { gasInfo } = await this.forceGetQueryClient().tx.simulate([this.registry.encodeAsAny(msgAny)], memo, pubkey, sequence);

        const gas = Math.round(gasInfo?.gasUsed.toNumber() as number * ChainConstants.MULTIPLIER);
        const usedFee = calculateFee(gas, ChainConstants.GAS_PRICE);
        const txRaw = await this.sign(this.address as string, [msgAny], usedFee, memo);

        const txBytes = Uint8Array.from(TxRaw.encode(txRaw).finish());
        const txHash = toHex(sha256(txBytes));

        return {
            txHash,
            txBytes,
            usedFee
        }

    }

    private async sequence() {
        try {
            const { sequence } = await this.getSequence(this.address as string);
            return sequence;
        } catch (error) {
            throw new Error('Insufficient amount of NLS');
        }
    }

    private createDeliverTxResponseErrorMessage(result: DeliverTxResponse) {
        return `Error when broadcasting tx ${result.transactionHash} at height ${result.height}. Code: ${result.code}; Raw log: ${result.rawLog}`;
    }
}
