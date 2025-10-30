// ==========================================================
// FIREBASE KONFIGURATION (Bitte mit Deinen Daten ersetzen!)
// ==========================================================
// BITTE HIER DEINE ECHTEN DATEN AUS DER FIREBASE-CONSOLE EINTRAGEN!
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // <--- HIER ERSETZEN
    authDomain: "YOUR_AUTH_DOMAIN", // <--- HIER ERSETZEN
    projectId: "YOUR_PROJECT_ID", // <--- HIER ERSETZEN
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ==========================================================
// 1. INITIALISIERUNG
// ==========================================================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const transactionsCol = collection(db, "transactions");

// ==========================================================
// 2. DOM-ELEMENTE ZUWEISEN (Für Klicks und Anzeigen)
// ==========================================================
const welcomeScreen = document.getElementById('welcome-screen');
const appContent = document.getElementById('app-content');
const financeControl = document.getElementById('titan-finanzkontrolle');

const eintrittBtn = document.getElementById('eintritt-btn');
const openFinanceBtn = document.getElementById('open-finance-2');
const backToAppBtn = document.getElementById('back-to-app');

const openInputBtn = document.getElementById('open-input');
const openChronikBtn = document.getElementById('open-chronik');

const buchungsInputSection = document.getElementById('buchungs-input');
const buchungsChronikSection = document.getElementById('buchungs-chronik');

const transactionForm = document.getElementById('transaction-form');
const balanceDisplay = document.getElementById('balance-display');
const transactionsList = document.getElementById('transactions-list');
const statusMessage = document.getElementById('status-message');


// ==========================================================
// 3. FUNKTIONEN (Logik)
// ==========================================================

function showScreen(screenToShow) {
    [welcomeScreen, appContent, financeControl].forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    if (screenToShow) {
        screenToShow.classList.add('active');
    }
}

async function addTransaction(e) {
    e.preventDefault();
    
    const amountInput = document.getElementById('transaction-amount');
    const descriptionInput = document.getElementById('transaction-description');
    const typeInput = document.getElementById('transaction-type');

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;
    const type = typeInput.value;

    if (isNaN(amount) || amount <= 0 || !description) {
        statusMessage.textContent = "FEHLER: Ungültiger Betrag/Beschreibung!";
        statusMessage.style.color = '#e94560'; // Rot
        return;
    }

    statusMessage.textContent = "BUCHUNG WIRD INS REICH EINGEFÜGT...";
    statusMessage.style.color = '#e94560'; // Rot

    try {
        await addDoc(transactionsCol, {
            amount: amount,
            description: description,
            type: type,
            timestamp: new Date()
        });
        
        amountInput.value = '';
        descriptionInput.value = '';
        
        statusMessage.textContent = "BUCHUNG ERFOLGREICH EINGEFÜGT!";
        statusMessage.style.color = '#4CAF50'; // Grün

    } catch (e) {
        console.error("Fehler beim Hinzufügen des Dokuments: ", e);
        statusMessage.textContent = "FEHLER: KONNTE NICHT SPEICHERN! (Prüfe Firebase Config!)";
        statusMessage.style.color = '#e94560'; // Rot
    }
}

function setupChronikListener() {
    // Abfrage sortiert nach Zeitstempel, neueste zuerst
    const q = query(transactionsCol, orderBy("timestamp", "desc"));

    // LIVE-LISTENER, der bei jeder Änderung die Bilanz und Chronik aktualisiert
    onSnapshot(q, (snapshot) => {
        let totalBalance = 0;
        let htmlContent = '';
        
        transactionsList.innerHTML = ''; // Liste leeren
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Betrag für Berechnung anpassen
            const displayAmount = (data.type === 'inflow' ? data.amount : -data.amount);
            const sign = data.type === 'inflow' ? '+' : '-';
            
            totalBalance += displayAmount;
            
            // HTML für Eintrag erstellen
            const transactionClass = data.type === 'inflow' ? 'inflow' : 'outflow';
            htmlContent += `
                <li class="${transactionClass}">
                    <span class="description">${data.description}</span>
                    <span class="amount">${sign} ${data.amount.toFixed(2)} €</span>
                </li>
            `;
        });
        
        // Bilanz aktualisieren
        balanceDisplay.textContent = totalBalance.toFixed(2) + ' €';
        balanceDisplay.style.color = totalBalance >= 0 ? '#4CAF50' : '#e94560'; // Grün oder Rot
        
        if (snapshot.size === 0) {
            transactionsList.innerHTML = '<li><span class="description">Noch keine Buchungen im Reich!</span></li>';
            statusMessage.textContent = 'BILANZ KORRIGIERT. Das Feld ist leer. Starte die erste Buchung!';
            statusMessage.style.color = '#0f3460'; // Blau
        } else {
            transactionsList.innerHTML = htmlContent;
            statusMessage.textContent = `${snapshot.size} Transaktionen geladen. BILANZ KORRIGIERT.`;
            statusMessage.style.color = '#0f3460'; // Blau
        }
    }, (error) => {
        console.error("Fehler beim Laden der Chronik: ", error);
        statusMessage.textContent = "FATALER FEHLER: Chronik konnte nicht geladen werden! (Firebase-Verbindung prüfen)";
        statusMessage.style.color = '#e94560'; // Rot
    });
}


function showFinanceSection(sectionToShow) {
    [buchungsInputSection, buchungsChronikSection].forEach(section => {
        if (section) {
            section.classList.remove('active');
        }
    });
    
    [openInputBtn, openChronikBtn].forEach(btn => {
        if (btn) {
            btn.classList.remove('active');
        }
    });

    if (sectionToShow === 'input') {
        buchungsInputSection.classList.add('active');
        openInputBtn.classList.add('active');
    } else if (sectionToShow === 'chronik') {
        buchungsChronikSection.classList.add('active');
        openChronikBtn.classList.add('active');
    }
}


// ==========================================================
// 4. EVENT LISTENERS (Klicks)
// ==========================================================
// Der App-Start wird von hier getriggert

// Startet die App vom Willkommensbildschirm
if (eintrittBtn) {
    eintrittBtn.addEventListener('click', () => {
        showScreen(appContent);
    });
}

// Öffnet die Finanzkontrolle
if (openFinanceBtn) {
    openFinanceBtn.addEventListener('click', () => {
        showScreen(financeControl);
        // Startet sofort den LIVE-LISTENER, um Bilanz zu holen
        setupChronikListener(); 
        showFinanceSection('input'); // Startet mit Eingabe
    });
}

// Zurück zum App-Hauptportal
if (backToAppBtn) {
    backToAppBtn.addEventListener('click', () => {
        showScreen(appContent);
    });
}

// Schaltet um auf die Buchungseingabe
if (openInputBtn) {
    openInputBtn.addEventListener('click', () => {
        showFinanceSection('input');
    });
}

// Schaltet um auf die Transaktions-Chronik
if (openChronikBtn) {
    openChronikBtn.addEventListener('click', () => {
        showFinanceSection('chronik');
    });
}

// Formular-Submit für Buchung
if (transactionForm) {
    transactionForm.addEventListener('submit', addTransaction);
}


// ==========================================================
// 5. APP-START
// ==========================================================
showScreen(welcomeScreen);
