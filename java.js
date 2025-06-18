// Wenn Seite geladen ist
document.addEventListener("DOMContentLoaded", () => {
    warenkorbZaehlerAktualisieren(); // Zähler anzeigen

    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const produktCard = button.closest(".product-card");
            const name = produktCard.querySelector(".product-name").innerText;
            const preisText = produktCard.querySelector(".product-price").innerText;
            const preis = parseFloat(preisText.replace("€", "").replace(",", "."));
            const id = produktCard.getAttribute("data-id");

            produktHinzufuegen(name, preis, id);
        });
    });
});

function produktHinzufuegen(name, preis, id) {
    const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];

    const vorhanden = warenkorb.find(p => p.id === id);
    if (vorhanden) {
        vorhanden.menge++;
    } else {
        warenkorb.push({ id, name, preis, menge: 1 });
    }

    localStorage.setItem("warenkorb", JSON.stringify(warenkorb));
    warenkorbZaehlerAktualisieren();
}

function warenkorbZaehlerAktualisieren() {
    const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];
    const total = warenkorb.reduce((summe, p) => summe + p.menge, 0);
    const zaehler = document.getElementById("warenkorb-zaehler");
    if (zaehler) {
        zaehler.innerText = total;
    }
}
// Nur auf warenkorb.html
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("warenkorb-inhalt");
    if (container) {
        const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];

        if (warenkorb.length === 0) {
            container.innerHTML = "<p>Dein Warenkorb ist leer.</p>";
            return;
        }

        warenkorb.forEach(p => {
            const eintrag = document.createElement("div");
            eintrag.innerText = `${p.name} – ${p.menge} x ${p.preis.toFixed(2)}€`;
            container.appendChild(eintrag);
        });

        warenkorbZaehlerAktualisieren();
    }
});
