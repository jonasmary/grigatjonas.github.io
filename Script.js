 import crypto from 'crypto'; 

// Der konsolidierte Schutzcode Primzahl-Nebel V.∞
export const PRIMZAHL_NEBEL = [ 
    809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 
    1361, 1367, 1373, 1381, 1399, 1409, 1423, 1427, 1429, 1433, 1439, 1447, 1451, 1453, 1459, 1471, 1481, 1483, 1487, 1489, 1493, 1499, 1511, 1523 
]; 

export function primesSeed(){ 
    return PRIMZAHL_NEBEL.join(','); 
} 

// Dies ist nur für die Entwicklung! In der echten Welt wird dies durch den HSM-Tresor ersetzt. 
export function createHmacSignature(payloadObj, secret){ 
    const payload = JSON.stringify(payloadObj); 
    const h = crypto.createHmac('sha512', secret); 
    h.update('PRIMSEED:' + primesSeed()); 
    h.update(payload); 
    return h.digest('hex'); 
}
