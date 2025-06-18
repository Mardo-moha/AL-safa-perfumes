// java.js - Vollständige überarbeitete Version
document.addEventListener('DOMContentLoaded', function() {
    // 1. Header Scroll-Verhalten
    initHeaderScroll();
    
    // 2. Mobile Navigation
    initMobileMenu();
    
    // 3. Warenkorb-System
    initCartSystem();
});

// ==================== HEADER FUNKTIONALITÄT ====================
function initHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100 && currentScroll > lastScroll) {
            header.classList.add('header-scrolled');
            header.style.transform = 'translateY(-100%)';
        } else {
            header.classList.add('header-scrolled');
            header.style.transform = 'translateY(0)';
        }
        
        if (currentScroll < 50) {
            header.classList.remove('header-scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ==================== MOBILE MENÜ ====================
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (!menuBtn || !nav) return;
    
    menuBtn.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.classList.toggle('open');
    });
}

// ==================== WARENKORB SYSTEM ====================
let cart = [];

function initCartSystem() {
    loadCart();
    setupCartInteractions();
    updateCartCounter();
}

function loadCart() {
    const savedCart = localStorage.getItem('alsafa-cart');
    cart = savedCart ? JSON.parse(savedCart) : [];
}

function saveCart() {
    localStorage.setItem('alsafa-cart', JSON.stringify(cart));
    updateCartCounter();
    if (document.getElementById('cart-items-container')) {
        renderCartItems();
    }
}

function setupCartInteractions() {
    // Warenkorb-Buttons auf Produktseiten
    if (document.querySelector('.product-card')) {
        document.querySelectorAll('.product-card .btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                addProductToCart(this);
            });
        });
    }
    
    // Entfernen-Buttons auf Warenkorb-Seite
    if (document.getElementById('cart-items-container')) {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-item')) {
                removeFromCart(e.target.dataset.id);
            }
        });
    }
}

function addProductToCart(button) {
    const card = button.closest('.product-card');
    if (!card) {
        console.error("Produktkarte nicht gefunden");
        return;
    }

    const product = {
        id: card.dataset.id || `prod-${Date.now()}`,
        name: card.querySelector('.product-name')?.textContent.trim() || "Unbekanntes Produkt",
        price: parsePrice(card.querySelector('.product-price')?.textContent),
        image: extractBackgroundImage(card.querySelector('.product-image')),
        quantity: 1
    };

    addToCart(product);
    showFeedback(`${product.name} wurde hinzugefügt`);
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push(product);
    }
    
    saveCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    container.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${formatPrice(item.price)} × ${item.quantity}</p>
                <button class="remove-item" data-id="${item.id}">Entfernen</button>
            </div>
        `;
        container.appendChild(itemElement);
    });
    
    // Gesamtsumme aktualisieren
    if (document.querySelector('.total-price')) {
        const total = subtotal + 5.99; // Versandkosten
        document.querySelector('.subtotal').textContent = formatPrice(subtotal);
        document.querySelector('.total-price').textContent = formatPrice(total);
    }
}

// ==================== HELPER FUNCTIONS ====================
function updateCartCounter() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.className = 'cart-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
}

function parsePrice(priceString) {
    if (!priceString) return 0;
    return parseFloat(priceString.replace('€','').replace('.','').replace(',','.'));
}

function formatPrice(amount) {
    return amount.toFixed(2).replace('.', ',') + '€';
}

function extractBackgroundImage(element) {
    if (!element) return '';
    const match = element.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : '';
}