// ==========================================================
// FIREBASE KONFIGURATION (Bitte mit Deinen Daten ersetzen!)
// ==========================================================
// WICHTIG: Wenn die App nicht funktioniert, liegt es an diesen Simulierungsdaten.
// Bitte mit Deinen ECHTEN Daten aus der Firebase-Console eintragen!
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // <--- HIER MIT DEINEM ECHTEN API KEY ERSETZEN
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
const balanceDisplay = document.getElementById('current-balance'); // Korrigierte ID
const transactionsList = document.getElementById('transactions-list');
const statusMessage = document.getElementById('status-message');


// ==========================================================
// 3. FUNKTIONEN (Logik)
// ==========================================================

// --- Screen-Wechsel Logik ---
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

// --- Buchungs-Funktion ---
async function addTransaction(type) {
    const amountInput = document.getElementById('transaction-amount');
    const descriptionInput = document.getElementById('transaction-description');

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;

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

// --- Echtzeit-Chronik und Bilanz ---
function setupChronikListener() {
    const q = query(transactionsCol, orderBy("timestamp", "desc"));

    // LIVE-LISTENER, der bei jeder Änderung die Bilanz und Chronik aktualisiert
    onSnapshot(q, (snapshot) => {
        let totalBalance = 0;
        let htmlContent = '';
        
        transactionsList.innerHTML = ''; // Liste leeren
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            const displayAmount = (data.type === 'Einnahme' ? data.amount : -data.amount);
            const sign = data.type === 'Einnahme' ? '+' : '-';
            
            totalBalance += displayAmount;
            
            // HTML für Eintrag erstellen
            const transactionClass = data.type === 'Einnahme' ? 'inflow' : 'outflow';
            htmlContent += `
                <li class="${transactionClass}">
                    <span class="description">${data.description}</span>
                    <span class="amount">${sign} ${data.amount.toFixed(2)} €</span>
                </li>
            `;
        });
        
        // Bilanz aktualisieren (zeigt nur den Wert an, ohne € Zeichen)
        balanceDisplay.textContent = `${totalBalance.toFixed(2)} €`;
        
        if (snapshot.size === 0) {
            transactionsList.innerHTML = '<li><span class="description">Noch keine Energieflüsse im Reich!</span></li>';
        } else {
            transactionsList.innerHTML = htmlContent;
        }

    }, (error) => {
        console.error("Fehler beim Laden der Chronik: ", error);
        statusMessage.textContent = "FATALER FEHLER: Chronik konnte nicht geladen werden!";
        statusMessage.style.color = '#e94560';
    });
}


// ==========================================================
// 4. EVENT LISTENERS (Klicks)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // START: Zeigt den Willkommensbildschirm
    showScreen(welcomeScreen);

    // Eintritt in die App (Wird durch Klick auf MANIFESTATION STARTEN ausgelöst)
    if (eintrittBtn) {
        eintrittBtn.addEventListener('click', () => {
            showScreen(appContent);
            // Startet den Listener sofort beim Eintritt
            setupChronikListener(); 
        });
    }

    // Zurück zur Haupt-App
    if (backToAppBtn) {
        backToAppBtn.addEventListener('click', () => {
            showScreen(appContent);
        });
    }
    
    // Öffnet die Finanzkontrolle
    if (openFinanceBtn) {
        openFinanceBtn.addEventListener('click', () => {
            showScreen(financeControl);
            showFinanceSection('input'); // Startet mit Eingabe
        });
    }
    
    // Gnosis Raum betreten (Wird in der nächsten Phase programmiert)
    window.enterGnosisRoom = (roomName) => {
        statusMessage.textContent = `ÜBERGANG: ${roomName} wird aktiviert. Dualität wird aufgelöst.`;
        statusMessage.style.color = '#ffc700';
    };


    // --- Finanz-Navigation (Chronik/Eingabe) ---
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

    if (openInputBtn) {
        openInputBtn.addEventListener('click', () => {
            showFinanceSection('input');
        });
    }

    if (openChronikBtn) {
        openChronikBtn.addEventListener('click', () => {
            showFinanceSection('chronik');
        });
    }
    
    // --- Formular-Submit für Buchung ---
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const typeInput = document.getElementById('transaction-type');
            const type = typeInput.value === 'inflow' ? 'Einnahme' : 'Ausgabe'; // Übersetzt in den deutschen Typ

            // Ruft die asynchrone Buchungsfunktion auf
            addTransaction(type);
        });
    }
});
