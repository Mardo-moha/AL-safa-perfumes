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
// Bestellformular verarbeiten
document.getElementById('checkout-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const order = {
        customer: {
            vorname: document.getElementById('vorname').value,
            nachname: document.getElementById('nachname').value,
            email: document.getElementById('email').value,
            telefon: document.getElementById('telefon').value,
            adresse: {
                strasse: document.getElementById('strasse').value,
                plz: document.getElementById('plz').value,
                stadt: document.getElementById('stadt').value,
                land: document.getElementById('land').value
            }
        },
        items: JSON.parse(localStorage.getItem('alsafa-cart')) || [],
        bestelldatum: new Date().toISOString(),
        bestellnummer: 'AL-' + Date.now(),
        status: 'Neu'
    };

    sendOrder(order);
});

// Bestellung speichern
async function sendOrder(order) {
    try {
        // 1. EmailJS für E-Mail-Benachrichtigung (kostenlos)
        if (typeof emailjs !== 'undefined') {
            await emailjs.send('service_id', 'template_id', {
                to_email: order.customer.email,
                order_number: order.bestellnummer,
                order_details: formatOrderDetails(order)
            });
        }

        // 2. Google Forms als einfache Datenbank
        await saveToGoogleForms(order);
        
        // 3. Local Storage als Fallback
        const orders = JSON.parse(localStorage.getItem('alsafa-orders')) || [];
        orders.push(order);
        localStorage.setItem('alsafa-orders', JSON.stringify(orders));
        
        // Bestätigung anzeigen
        document.getElementById('checkout-form').style.display = 'none';
        document.getElementById('order-confirmation').style.display = 'block';
        document.getElementById('order-number').textContent = order.bestellnummer;
        document.getElementById('customer-email').textContent = order.customer.email;
        
        // Warenkorb leeren
        localStorage.removeItem('alsafa-cart');
        updateCartCounter();
        
    } catch (error) {
        console.error("Fehler beim Senden der Bestellung:", error);
        alert("Es gab ein Problem bei der Bestellung. Bitte versuchen Sie es später erneut.");
    }
}

// Hilfsfunktion für Google Forms
async function saveToGoogleForms(order) {
    const formData = new FormData();
    formData.append('entry.123456789', order.bestellnummer); // Feld-ID anpassen
    formData.append('entry.987654321', JSON.stringify(order));
    
    await fetch('https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    });
}

function formatOrderDetails(order) {
    let details = `Bestellung #${order.bestellnummer}\n\n`;
    details += `Datum: ${new Date(order.bestelldatum).toLocaleString()}\n\n`;
    details += "Artikel:\n";
    
    order.items.forEach(item => {
        details += `- ${item.name} (${item.quantity}x ${item.price}€)\n`;
    });
    
    details += `\nGesamt: ${calculateTotal(order.items)}€\n\n`;
    details += `Kunde: ${order.customer.vorname} ${order.customer.nachname}\n`;
    details += `Email: ${order.customer.email}\n`;
    details += `Adresse: ${order.customer.adresse.strasse}, ${order.customer.adresse.plz} ${order.customer.adresse.stadt}, ${order.customer.adresse.land}`;
    
    return details;
}

function calculateTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
}
