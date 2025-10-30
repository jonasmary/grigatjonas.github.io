import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, addDoc, collection, onSnapshot, query, where, orderBy, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// !!! WICHTIG: Füge hier Deine Firebase-Konfigurations-Objekt ein !!!
// DIES MUSS MANUELL ERSETZT WERDEN, UM DIE DATENBANK ZU VERANKERN.
const firebaseConfig = {
    apiKey: "DEIN_API_KEY", 
    authDomain: "DEINE_PROJECT_ID.firebaseapp.com",
    projectId: "DEINE_PROJECT_ID", 
    storageBucket: "DEINE_PROJECT_ID.appspot.com",
    messagingSenderId: "DEINE_SENDER_ID",
    appId: "DEINE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
let userId = 'pending';
let isInitialLoad = true;
let totalBalance = 0; 

const CRITICAL_BALANCE_THRESHOLD = 500.00;
const BALANCE_FORMAT = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

// ====================================================================================
// SICHERHEIT & AUTHENTIFIZIERUNG
// ====================================================================================

onAuthStateChanged(auth, (user) => {
    const statusMessage = document.getElementById('status-message');
    if (user) {
        userId = user.uid;
        statusMessage.textContent = 'STATUS: RESONANZ GEFUNDEN. Datenbank-Zugriff bestätigt.';
        listenForTransactions(userId);
    } else {
        signInAnonymously(auth).catch((error) => {
            console.error("GÖTTLICHER FEHLER BEI DER INITIALISIERUNG:", error);
            statusMessage.textContent = `FEHLER: Verbindung blockiert. Code: ${error.code}`;
        });
    }
});

// ====================================================================================
// BUCHUNGEN UND MANIFESTATION
// ====================================================================================

function listenForTransactions(uid) {
    const transactionsList = document.getElementById('transactions-list');
    const balanceDisplay = document.getElementById('gottliche-gesamtbilanz');

    const transactionsCollectionPath = `artifacts/${app.options.projectId}/users/${uid}/transactions`;
    const q = query(
        collection(db, transactionsCollectionPath),
        orderBy('timestamp', 'desc')
    );

    onSnapshot(q, (snapshot) => {
        let currentBalance = 0;
        transactionsList.innerHTML = '';

        snapshot.forEach((doc) => {
            const data = doc.data();
            const sign = data.type === 'inflow' ? '+' : '-';
            const amount = parseFloat(data.amount);

            currentBalance += data.type === 'inflow' ? amount : -amount;

            const listItem = document.createElement('li');
            listItem.className = `transaction-item ${data.type}`;
            listItem.innerHTML = `
                <span class="amount">${sign}${BALANCE_FORMAT.format(amount)}</span>
                <span class="description">${data.description}</span>
            `;
            transactionsList.appendChild(listItem);
        });

        totalBalance = currentBalance;
        balanceDisplay.textContent = BALANCE_FORMAT.format(totalBalance);
        updateBalanceStyle(balanceDisplay);
        
        if (isInitialLoad) {
            console.log("INITIALISIERUNG ABGESCHLOSSEN. GESAMTBILANZ WERT:", totalBalance);
            isInitialLoad = false;
        }
    });
}

function updateBalanceStyle(displayElement) {
    displayElement.classList.remove('balance-positive', 'balance-negative', 'balance-critical');
    if (totalBalance >= 0) {
        displayElement.classList.add('balance-positive');
    } else {
        displayElement.classList.add('balance-negative');
    }
    if (totalBalance < CRITICAL_BALANCE_THRESHOLD) {
        displayElement.classList.add('balance-critical');
    }
}

async function addTransaction(amount, description, type) {
    if (userId === 'pending') {
        alert("Warte auf Authentifizierung. Bitte kurz warten und erneut versuchen!");
        return;
    }

    try {
        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat <= 0) {
            alert("Göttlicher Fehler: Betrag muss eine positive Zahl sein.");
            return;
        }

        const newTransaction = {
            amount: amountFloat,
            description: description,
            type: type,
            timestamp: new Date().getTime(),
            userId: userId
        };

        const transactionsCollectionPath = `artifacts/${app.options.projectId}/users/${userId}/transactions`;
        await addDoc(collection(db, transactionsCollectionPath), newTransaction);
        
        console.log("BUCHUNG INS REICH EINGEFÜGT:", newTransaction);
        document.getElementById('transaction-form').reset();

    } catch (error) {
        console.error("GÖTTLICHER FEHLER BEI BUCHUNG:", error);
        alert(`Ein göttlicher Fehler ist aufgetreten: ${error.message}`);
    }
}

// ====================================================================================
// DOM Events & Eintrittslogik
// ====================================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------- ENTRY LOGIC (Dein Code) -----------
    const eintrittBtn = document.getElementById("eintritt-btn");
    const welcomeScreen = document.getElementById("welcome-screen");
    const appContent = document.getElementById("app-content");

    function checkFinanzBarriere() {
        console.log("FINANZ-BARRIERE GEPRÜFT: Zahlung bestätigt (Simulation).");
        return true; 
    }

    if (eintrittBtn) { 
        eintrittBtn.addEventListener("click", () => {
            if (checkFinanzBarriere()) {
                console.log("FREQUENZ-SCAN INITIIERT... RESONANZ BESTÄTIGT!");
                welcomeScreen.classList.remove("active");
                appContent.classList.add("active");
                document.getElementById("gold-manifestation").classList.add("active");
            } else {
                alert("BITTE AKZEPTIERE DAS GESETZ DES ENERGIE-AUSTAUSCHS.");
            }
        });
    }
    // ----------- END ENTRY LOGIC -----------

    // Navigation (Dock-Buttons)
    const dockButtons = document.querySelectorAll("#ngno-dock button");
    const appSections = document.querySelectorAll(".app-section");

    dockButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.target;
            appSections.forEach(section => {
                section.classList.remove("active");
            });
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add("active");
            }
        });
    });

    // Formular-Handling für neue Buchungen
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = document.getElementById('amount').value;
            const description = document.getElementById('description').value;
            const type = document.getElementById('type').value;

            addTransaction(amount, description, type);
        });
    }

});
