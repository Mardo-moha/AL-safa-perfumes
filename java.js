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
// Warenkorb-Funktionalität
let cart = JSON.parse(localStorage.getItem('alsafa-cart')) || [];

// Warenkorb-Counter aktualisieren
function updateCartCounter() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
    });
}

// Warenkorb-Seite rendern
function renderCartPage() {
    if (!document.querySelector('.cart-page')) return;
    
    const cartItems = document.querySelector('.cart-items');
    const subtotalEl = document.querySelector('.subtotal');
    const totalEl = document.querySelector('.total-price');
    
    cartItems.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-img" style="background-image: url('${item.image}')"></div>
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p>${item.price} x ${item.quantity}</p>
                <div class="remove-item" data-id="${item.id}">Entfernen</div>
            </div>
        `;
        
        cartItems.appendChild(itemElement);
        subtotal += parseFloat(item.price.replace(',', '.')) * item.quantity;
    });
    
    subtotalEl.textContent = subtotal.toFixed(2).replace('.', ',') + '€';
    const total = subtotal + 5.99; // Versandkosten
    totalEl.textContent = total.toFixed(2).replace('.', ',') + '€';
    
    // Event Listener für Remove-Buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            removeFromCart(id);
        });
    });
}

// Produkt zum Warenkorb hinzufügen
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
}

// Produkt entfernen
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
}

// Warenkorb speichern
function saveCart() {
    localStorage.setItem('alsafa-cart', JSON.stringify(cart));
    updateCartCounter();
    renderCartPage();
}

// Event Listener für "Zum Warenkorb"-Buttons
document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
    renderCartPage();
    
    document.querySelectorAll('.product-card .btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const product = {
                id: productCard.getAttribute('data-id'),
                name: productCard.querySelector('.product-name').textContent,
                price: productCard.querySelector('.product-price').textContent.replace('€', ''),
                image: productCard.querySelector('.product-image').style.backgroundImage.slice(5, -2)
            };
            
            addToCart(product);
            
            // Auf Warenkorb-Seite weiterleiten wenn gewünscht
            // window.location.href = 'warenkorb.html';
        });
    });
});