// Warenkorb-Funktionen
let warenkorb = JSON.parse(localStorage.getItem('warenkorb')) || [];

function updateCartDisplay() {
    // Warenkorb-Zähler oben aktualisieren
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = warenkorb.reduce((sum, p) => sum + p.menge, 0);
    });

    // Warenkorb-Seite aktualisieren (falls wir auf warenkorb.html sind)
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        if (warenkorb.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-bag"></i>
                    <p>Ihr Warenkorb ist leer</p>
                    <a href="index.html#kollektion" class="btn">Zur Kollektion</a>
                </div>`;
        } else {
            let html = '';
            let gesamt = 0;
            
            warenkorb.forEach(p => {
                const preis = p.preis * p.menge;
                gesamt += preis;
                html += `
                    <div class="cart-item">
                        <strong>${p.name}</strong><br>
                        ${p.menge} x ${p.preis.toFixed(2)}€ = <strong>${preis.toFixed(2)}€</strong>
                    </div>`;
            });

            cartContainer.innerHTML = html;
            document.getElementById('item-count').textContent = `${warenkorb.length} Artikel`;
            document.querySelector('.subtotal').textContent = `${gesamt.toFixed(2)}€`;
            document.querySelector('.total-price').textContent = `${(gesamt + 5.99).toFixed(2)}€`;
        }
    }
}

// Produkt hinzufügen
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const produkt = button.closest('.product-card');
        const id = produkt.getAttribute('data-id');
        const name = produkt.querySelector('.product-name').textContent;
        const preis = parseFloat(produkt.querySelector('.product-price').textContent.replace('€', '').replace(',', '.'));

        const vorhanden = warenkorb.find(p => p.id === id);
        if (vorhanden) {
            vorhanden.menge++;
        } else {
            warenkorb.push({ id, name, preis, menge: 1 });
        }

        localStorage.setItem('warenkorb', JSON.stringify(warenkorb));
        updateCartDisplay();
    });
});

// Warenkorb leeren
document.getElementById('clear-cart')?.addEventListener('click', () => {
    localStorage.removeItem('warenkorb');
    warenkorb = [];
    updateCartDisplay();
});

// Bestellung abschicken
document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
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
        items: warenkorb,
        bestellnummer: 'AL-' + Date.now()
    };

    try {
        const response = await fetch('/api/bestellung', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Bestätigung anzeigen
            document.getElementById('order-number').textContent = order.bestellnummer;
            document.getElementById('customer-email').textContent = order.customer.email;
            document.getElementById('order-confirmation').style.display = 'block';
            document.getElementById('checkout-form').style.display = 'none';
            
            // Warenkorb leeren
            localStorage.removeItem('warenkorb');
            warenkorb = [];
            updateCartDisplay();
        }
    } catch (error) {
        alert('Fehler beim Absenden der Bestellung');
        console.error(error);
    }
});

// Initialisierung
updateCartDisplay();