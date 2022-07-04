import { globals } from '../globals/globals';
import { formatNumber } from './helpers';

export function calculateDeSoInUSD(p_nanos: number) {
    
    if (globals.exchangeRate) {
        const dollarPerDeSo = globals.exchangeRate.USDCentsPerDeSoExchangeRate / 100;
        const dollarPerNano = dollarPerDeSo / 1000000000;
        const usdtorupees = 76;
        let result = dollarPerNano * p_nanos;
        result = Math.round((result + Number.EPSILON) * 100 * usdtorupees) / 100;
        return result;
    }
    return 0;
}

export function calculateAndFormatDeSoInUsd(p_nanos: number) {
    return formatNumber(calculateDeSoInUSD(p_nanos));
}
