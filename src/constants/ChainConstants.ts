/**
 * Here you can find all necessary constants that describe the Nolus Network parameters.
 *
 * Usage:
 *
 * ```ts
 * import { ChainConstants } from '@nolus/nolusjs';
 *
 * const nolusCoinType = ChainConstants.COIN_TYPE;
 * ```
 */
export class ChainConstants {
    /* Coin configurations */
    public static readonly CHAIN_NAME: string = 'Nolus';
    public static readonly COIN_DENOM: string = 'nls';
    public static readonly COIN_MINIMAL_DENOM: string = 'unls';
    public static readonly COIN_DECIMALS: number = 6;
    public static readonly COIN_GECKO_ID: string = 'cosmos';
    public static readonly COIN_TYPE: number = 118;
    public static readonly GAS_PRICE: string = '0.0025unls';

    /* Chain configurations */
    public static readonly BECH32_PREFIX_ACC_ADDR: string = 'nolus';
    /**
     * value = BECH32_PREFIX_ACC_ADDR + 'pub'
     */
    public static readonly BECH32_PREFIX_ACC_PUB: string = this.BECH32_PREFIX_ACC_ADDR + 'pub';
    /**
     * value = BECH32_PREFIX_ACC_ADDR + 'valoper'
     */
    public static readonly BECH32_PREFIX_VAL_ADDR: string = this.BECH32_PREFIX_ACC_ADDR + 'valoper';
    /**
     * value = BECH32_PREFIX_ACC_ADDR + 'valoperpub'
     */
    public static readonly BECH32_PREFIX_VAL_PUB: string = this.BECH32_PREFIX_ACC_ADDR + 'valoperpub';
    /**
     * value = BECH32_PREFIX_ACC_ADDR + 'valcons'
     */
    public static readonly BECH32_PREFIX_CONS_ADDR: string = this.BECH32_PREFIX_ACC_ADDR + 'valcons';
    /**
     * value = BECH32_PREFIX_ACC_ADDR + 'valconspub'
     */
    public static readonly BECH32_PREFIX_CONS_PUB: string = this.BECH32_PREFIX_ACC_ADDR + 'valconspub';

    /* Wallet configurations */
    public static readonly BIP44_PATH: string = "44'/118'/0'/0/0";
}
