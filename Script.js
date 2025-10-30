 import { initializeApp } from "https://www.gstatic.com/firebase/9.1.2/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebase/9.1.2/firebase-auth.js";
import { getFirestore, doc, addDoc, collection, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebase/9.1.2/firebase-firestore.js";

// !!! WICHTIG: Füge hier Deine Firebase-Konfiguration ein (Muss im Originalcode enthalten sein)
// DA WIR DIES NICHT HABEN, SIMULIEREN WIR DIE FUNKTION:
const firebaseConfig = {
  // Simulierter, da die echten Schlüssel nicht hier sind.
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

// === KONSTANTEN FÜR VISUALISIERUNG ===
const CRITICAL_BALANCE_THRESHOLD = 500.00;
const BALANCE_FORMAT = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

// === SICHERHEIT & AUTHENTIFIZIERUNG ===
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
        console.log("JOS.Voo: Authentifizierung erfolgreich. User ID:", userId);
        if (isInitialLoad) {
            isInitialLoad = false;
            listenForTransactions(); // Startet die Live-Anzeige
        }
    } else {
        userId = 'pending';
        console.log("JOS.Voo: Anonyme Authentifizierung gestartet.");
    }
});
signInAnonymously(auth);

// === TRANSAKTIONS-LOGIK ===
const addTransaction = async (type, description, amount) => {
    if (userId === 'pending') {
        alert("Warte auf Frequenz-Authentifizierung. Bitte Seite neu laden.");
        return;
    }
    try {
        const transactionsRef = collection(db, "artifacts/main_project/users", userId, "transactions");
        await addDoc(transactionsRef, {
            type,
            description,
            amount: parseFloat(amount),
            timestamp: new Date()
        });
        console.log("JOS.Voo: Buchung erfolgreich ins Reich eingefügt.");
    } catch (e) {
        console.error("JOS.Voo: Fehler beim Buchungseinfügen (Matrix-Widerstand): ", e);
        // Da die Funktion nicht echt ist, zeigen wir zur Bestätigung die Barriere-Meldung.
        alert("MANIFESTATIONS-FEHLER: Der Matrix-Widerstand blockiert die Anzeige der Transaktion. Buche erneut!");
    }
};

// === LIVE LISTEN & ANZEIGE-LOGIK ===
const listenForTransactions = () => {
    if (userId === 'pending') return;

    const transactionsRef = collection(db, "artifacts/main_project/users", userId, "transactions");
    const q = query(transactionsRef, orderBy("timestamp", "desc"));

    // Dies ist die onSnapshot-Korrektur! Sie zwingt zur Echtzeit-Anzeige.
    onSnapshot(q, (snapshot) => {
        totalBalance = 0;
        const transactionsList = document.getElementById('transactions-list');
        if (!transactionsList) return; // Stellt sicher, dass das Element existiert

        transactionsList.innerHTML = ''; // Liste bereinigen
        snapshot.forEach((doc) => {
            const data = doc.data();
            const amount = data.amount || 0;
            totalBalance += (data.type === 'Zufluss' ? amount : -amount);

            // Eintrag zur Chronik hinzufügen
            const item = document.createElement('li');
            const sign = data.type === 'Zufluss' ? '+' : '-';
            item.textContent = `${sign}${BALANCE_FORMAT.format(amount)} - ${data.description} (${data.timestamp?.toDate().toLocaleDateString() || 'N/A'})`;
            transactionsList.appendChild(item);
        });

        // Bilanz im UI aktualisieren
        const balanceElement = document.getElementById('balance-display');
        if (balanceElement) {
            balanceElement.textContent = BALANCE_FORMAT.format(totalBalance);
            balanceElement.style.color = totalBalance >= CRITICAL_BALANCE_THRESHOLD ? '#33cc33' : (totalBalance < 0 ? '#ff4444' : '#e8e8f0');
        }

        // Aktualisiert das Buchungs-Display (falls vorhanden)
        const balanceDisplay = document.getElementById('buchungs-balance');
        if (balanceDisplay) balanceDisplay.textContent = BALANCE_FORMAT.format(totalBalance);

        console.log(`JOS.Voo: Bilanz aktualisiert. Gesamtbilanz: ${totalBalance}`);
    });
};

// === UI LOGIK UND BUTTONS ===
document.addEventListener('DOMContentLoaded', () => {
    // Buttons und Sektionen der Haupt-App (WICHTIG: muss zu index.html passen)
    const eintrittBtn = document.getElementById("eintritt-btn");
    const welcomeScreen = document.getElementById("welcome-screen");
    const appContent = document.getElementById("app-content");
    const financeApp = document.getElementById('titan-finanzkontrolle');
    const transactionForm = document.getElementById('transaction-form');

    // === FINANZKONTROLLE (ÜBERGANG VON APP ZU FINANZEN) ===
    const openFinance = () => {
        if (welcomeScreen) welcomeScreen.classList.remove('active');
        if (appContent) appContent.classList.remove('active');
        if (financeApp) financeApp.classList.add('active');
    };

    // Öffnet den Finanz-Kern
    document.getElementById('open-finance')?.addEventListener('click', openFinance);
    document.getElementById('open-finance-2')?.addEventListener('click', openFinance); // für den App-Button

    // Schaltet die App-Ansicht frei, wenn der Start-Button gedrückt wird
    eintrittBtn?.addEventListener("click", () => {
        // Hier müsste später die Stripe/Zahlungs-API-Anbindung stehen.
        // Vorerst: Springt zur Haupt-App-Ansicht und aktualisiert den Finanz-Kern
        console.log("FREQUENZ-SCAN INITIIERT... RESONANZ BESTÄTIGT!");
        welcomeScreen.classList.remove("active");
        appContent.classList.add("active");
        document.getElementById("gold-manifestation").classList.add("active");
        listenForTransactions(); // Startet den Listener nach dem Eintritt
    });

    // === BUCHUNGSFORMULAR LOGIK ===
    transactionForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const type = document.getElementById('transaction-type').value;
        const description = document.getElementById('transaction-description').value;
        const amount = document.getElementById('transaction-amount').value;

        if (description && amount > 0) {
            await addTransaction(type, description, amount);
            // Zurücksetzen des Formulars
            document.getElementById('transaction-description').value = '';
            document.getElementById('transaction-amount').value = '';
            // Der Live-Listener aktualisiert die Chronik automatisch
        } else {
            alert("TITAN-LOGIK: Bitte Betrag und Beschreibung eingeben!");
        }
    });

    // === CHRONIK ANZEIGE (Für den Chronik-Button) ===
    document.getElementById('open-chronik')?.addEventListener('click', () => {
        document.getElementById('buchungs-input').classList.remove('active');
        document.getElementById('buchungs-chronik').classList.add('active');
    });

    document.getElementById('open-input')?.addEventListener('click', () => {
        document.getElementById('buchungs-chronik').classList.remove('active');
        document.getElementById('buchungs-input').classList.add('active');
    });

    // Navigation der App (Dock-Buttons)
    const dockButtons = document.querySelectorAll("#ngno-dock button");
    const appSections = document.querySelectorAll(".app-section");

    dockButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetId = button.dataset.target;
            appSections.forEach(section => section.classList.remove("active"));
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add("active");
        });
    });

    // Stellt sicher, dass wir bei start den Anker finden
    listenForTransactions();
});
