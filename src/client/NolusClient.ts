import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { CometClient, connectComet } from '@cosmjs/tendermint-rpc';
import { Coin } from '@cosmjs/proto-signing';
import { StargateClient } from '@cosmjs/stargate';

/**
 * Nolus Client service class.
 *
 * Usage:
 *
 * ```ts
 * import { NolusClient } from '@nolus/nolusjs';
 *
 * NolusClient.setInstance(tendermintRpc);
 * ```
 */
export class NolusClient {
    private static instance: NolusClient | null = null;
    protected cosmWasmClient: Promise<CosmWasmClient> | undefined;
    protected tmClient: Promise<CometClient> | undefined;
    protected stargateClient: Promise<StargateClient> | undefined;

    private constructor(tendermintRpc: string) {
        this.cosmWasmClient = CosmWasmClient.connect(tendermintRpc);
        this.tmClient = connectComet(tendermintRpc);
        this.stargateClient = StargateClient.connect(tendermintRpc);
    }

    static getInstance() {
        if (this.instance === null) {
            throw new Error('Set the Tendermint RPC address before getting instance');
        }
        return this.instance;
    }

    static setInstance(tendermintRpc: string) {
        this.instance = new NolusClient(tendermintRpc);
    }

    public async getCosmWasmClient(): Promise<CosmWasmClient> {
        const client = await this.cosmWasmClient;
        if (!client) {
            throw new Error('Missing CosmWasm client');
        }
        return client;
    }

    public async getStargateClient(): Promise<StargateClient> {
        const client = await this.stargateClient;
        if (!client) {
            throw new Error('Missing StargateClient client');
        }
        return client;
    }

    public async getTendermintClient(): Promise<CometClient> {
        const client = await this.tmClient;
        if (!client) {
            throw new Error('Missing Tendermint client');
        }
        return client;
    }

    public getChainId = async (): Promise<string> => {
        const client = await this.cosmWasmClient;
        const chainId = await client?.getChainId();
        if (!chainId) {
            throw new Error('Chain ID is missing!');
        }
        return chainId;
    };

    public async getBalance(address: string, denom: string): Promise<Coin> {
        const client = await this.cosmWasmClient;
        const balance = client?.getBalance(address, denom);
        if (!balance) {
            throw new Error('Balance is missing!');
        }
        return await balance;
    }

    public async getBlockHeight(): Promise<number> {
        const client = await this.cosmWasmClient;
        const block = await client?.getBlock();
        if (!block?.header) {
            throw new Error('Block height is missing!');
        }
        return block?.header.height;
    }
}
