import { LeaserConfig } from '../types';

export const leaseQuoteMsg = (downpaymentAmount: string, downpaymentCurrency: string, leaseAsset: string, max_ltv?: number) => {
    if (max_ltv === null)
        return {
            quote: {
                lease_asset: leaseAsset,
                downpayment: {
                    ticker: downpaymentCurrency,
                    amount: downpaymentAmount,
                },
            },
        };
    return {
        quote: {
            lease_asset: leaseAsset,
            downpayment: {
                ticker: downpaymentCurrency,
                amount: downpaymentAmount,
            },
            max_ltv: max_ltv,
        },
    };
};

export const getCurrentOpenLeasesByOwnerMsg = (ownerAddress: string) => {
    return {
        leases: {
            owner: ownerAddress,
        },
    };
};

export const getLeaserConfigMsg = () => {
    return {
        config: {},
    };
};

export const openLeaseMsg = (leaseCurrency: string, max_ltv?: number) => {
    if (max_ltv === null)
        return {
            open_lease: {
                currency: leaseCurrency,
            },
        };

    return {
        open_lease: {
            currency: leaseCurrency,
            max_ltv: max_ltv,
        },
    };
};

export const setLeaserConfigMsg = (leaserConfig: LeaserConfig) => {
    return leaserConfig;
};
