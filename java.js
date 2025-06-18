// Wenn Seite geladen ist
document.addEventListener("DOMContentLoaded", () => {
    warenkorbZaehlerAktualisieren(); // Zähler oben anzeigen

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

    // Dieser Bereich läuft nur auf warenkorb.html
    const container = document.getElementById("cart-items-container");
    if (container) {
        const warenkorb = JSON.parse(localStorage.getItem("warenkorb")) || [];

        const itemCount = document.getElementById("item-count");
        const subtotalEl = document.querySelector(".subtotal");
        const totalPriceEl = document.querySelector(".total-price");

        if (warenkorb.length === 0) {
            return; // Leere Nachricht bleibt sichtbar
        }

        container.innerHTML = "";

        let gesamt = 0;

        warenkorb.forEach(p => {
            const eintrag = document.createElement("div");
            eintrag.classList.add("cart-item");
            const einzelpreis = (p.preis * p.menge).toFixed(2);
            gesamt += parseFloat(einzelpreis);

            eintrag.innerHTML = `
                <strong>${p.name}</strong><br>
                ${p.menge} x ${p.preis.toFixed(2)}€ = <strong>${einzelpreis}€</strong>
            `;
            container.appendChild(eintrag);
        });

        if (itemCount) itemCount.innerText = `${warenkorb.length} Artikel`;
        if (subtotalEl) subtotalEl.innerText = `${gesamt.toFixed(2).replace(".", ",")}€`;
        if (totalPriceEl) totalPriceEl.innerText = `${(gesamt + 5.99).toFixed(2).replace(".", ",")}€`;

        warenkorbZaehlerAktualisieren();

        const clearBtn = document.getElementById("clear-cart");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                localStorage.removeItem("warenkorb");
                location.reload();
            });
        }
    }
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
