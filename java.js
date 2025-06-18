// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Header kleiner beim Scrollen
    const header = document.getElementById('main-header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100 && currentScroll > lastScroll) {
            // Nach unten scrollen
            header.classList.add('header-scrolled');
            header.style.transform = 'translateY(-100%)';
        } else {
            // Nach oben scrollen oder oben
            header.classList.add('header-scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        if (currentScroll < 50) {
            header.classList.remove('header-scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile Menü Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    menuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('open');
    });
});
// java.js
// GLOBALE VARIABLEN
let cart = [];

// INITIALISIERUNG BEIM LADEN
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    setupAddToCartButtons();
    
    // Warenkorb-Seite spezifische Logik
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
});

// WARENKORB LADEN
function loadCart() {
    const savedCart = localStorage.getItem('alsafa-cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
    updateCartCounter();
}

// PRODUKT HINZUFÜGEN
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    showFeedback(`${product.name} hinzugefügt`);
}

// WARENKORB ANZEIGEN
function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    container.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${parseFloat(item.price).toFixed(2)}€ × ${item.quantity}</p>
                <button class="remove-item" data-id="${item.id}">Entfernen</button>
            </div>
        `;
        container.appendChild(itemElement);
        subtotal += item.price * item.quantity;
    });
    
    // Event Listener für Remove-Buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            removeFromCart(this.getAttribute('data-id'));
        });
    });
    
    // Gesamtsumme aktualisieren
    document.querySelector('.total-price').textContent = (subtotal + 5.99).toFixed(2) + '€';
}

// BUTTONS INITIALISIEREN
function setupAddToCartButtons() {
    document.querySelectorAll('.product-card .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.product-card');
            const product = {
                id: card.getAttribute('data-id'),
                name: card.querySelector('.product-name').textContent.trim(),
                price: parseFloat(card.querySelector('.product-price').textContent.replace('€','').replace(',','.')),
                image: card.querySelector('.product-image').style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)[1]
            };
            addToCart(product);
        });
    });
}

// HILFSFUNKTIONEN
function saveCart() {
    localStorage.setItem('alsafa-cart', JSON.stringify(cart));
    updateCartCounter();
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
}

function updateCartCounter() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
}