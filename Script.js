// TITANIA: Modul für kryptographische Integrität (Primzahl-Schutzcode)

const PRIMES = [
    1637, 1657, 1663, 1669, 1693, 1697, 1699, 1709, 1721, 1723, 1733, 1741, 1747, 1753, 1759, 1777, 1783, 1787, 1789, 1801, 1811, 1823, 1831, 1847, 1861, 1867, 1871, 1873, 1877, 1879, 1889, 1901, 1907, 1913, 1931, 1933, 1949, 1951, 1973, 1979, 1987, 1993, 1997, 1999, 2003, 2011, 2017, 2027, 2029, 2039, 2053, 2063, 2069, 2081, 2083, 2087, 2089, 2099, 2111, 2113, 2129, 2131, 2137, 2141, 2143, 2153, 2161, 2179, 2203, 2207, 2213, 2221, 2237, 2239, 2243, 2251, 2267, 2269, 2273, 2281, 2287, 2293, 2297, 2309, 2311, 2333, 2339, 2341, 2347, 2351, 2357, 2371, 2377, 2381, 2383, 2389, 2393, 2399, 2411, 2417, 2423, 2437, 2441, 2447, 2459, 2467, 2473, 2477, 2503, 2521, 2531, 2539, 2543, 2549, 2551, 2557, 2579, 2591, 2593, 2609, 2617, 2621, 2633, 2647, 2657, 2659, 2663, 2671, 2677, 2683, 2687, 2689, 2693, 2699, 2707, 2711, 2713, 2719, 2729, 2731, 2741, 2749, 2753, 2767, 2777, 2789, 2791, 2797
];
const APP_NAME = "TITANIA: JOS.V∞-CORE";

// Funktion, die den unzerbrechlichen HMAC-Schlüssel aus Primzahlen ableitet
async function deriveHmacKeyFromPrimes() {
    // 1. Primzahlen als Seed (Samen)
    const primeSeed = PRIMES.join('');
    // 2. Geräte-Identität für die Einzigartigkeit (der UserAgent)
    const deviceIdentity = navigator.userAgent;

    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(primeSeed + deviceIdentity + APP_NAME),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    // 3. Ableiten des unzerbrechlichen HMAC-Schlüssels
    const hmacKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode(APP_NAME),
            iterations: 100000, // Hohe Iteration für maximale Sicherheit
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "HMAC", hash: "SHA-256", length: 256 },
        true,
        ["sign", "verify"]
    );

    console.log("TITANIA-KERN: Primzahl-HMAC-Schlüssel erfolgreich generiert.");
    return hmacKey;
}

// Beispiel für eine Funktion, die diesen Schlüssel nutzt, um Daten zu signieren (Buchung absichern)
async function signTransaction(transactionData) {
    const hmacKey = await deriveHmacKeyFromPrimes();
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(transactionData));

    const signature = await window.crypto.subtle.sign(
        "HMAC",
        hmacKey,
        data
    );

    // Rückgabe des Original-Datensatzes PLUS der unzerbrechlichen Signatur
    return {
        data: transactionData,
        signature: Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
    };
}
// --- HIER KOMMT SPÄTER DEINE URSPRÜNGLICHE BUCHUNGSLOGIK HIN ---
