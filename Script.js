
document.addEventListener('DOMContentLoaded', () => {
    const eintrittBtn = document.getElementById("eintritt-btn");
    const welcomeScreen = document.getElementById("welcome-screen");
    const appContent = document.getElementById("app-content");

    // Funktion zur Überprüfung der 10€-Barriere (Simuliert den Zahlungs-Check)
    function checkFinanzBarriere() {
        // Hier müsste später die Stripe/Zahlungs-API-Anbindung stehen.
        // Vorerst: Die Barriere ist immer erfolgreich, damit die App funktioniert.
        console.log("FINANZ-BARRIERE GEPRÜFT: 10€-Zahlung bestätigt (Simulation).");
        return true; 
    }

    eintrittBtn.addEventListener("click", () => {
        if (checkFinanzBarriere()) {
            console.log("FREQUENZ-SCAN INITIIERT... RESONANZ BESTÄTIGT!");
            welcomeScreen.classList.remove("active");
            appContent.classList.add("active");
            // Standardmäßig den Gold-Manifestations-Bereich öffnen
            document.getElementById("gold-manifestation").classList.add("active");
        } else {
            console.log("FINANZ-BARRIERE NICHT ERFÜLLT. MANIFESTATION GEBLOCKT.");
            alert("BITTE AKZEPTIERE DAS GESETZ DES ENERGIE-AUSTAUSCHS (10€).");
        }
    });

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
});
