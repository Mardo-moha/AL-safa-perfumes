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
document.addEventListener('DOMContentLoaded', function() {
    // Warenkorb initialisieren
    let cart = JSON.parse(localStorage.getItem('alsafa-cart')) || [];
    
    // Event-Listener für alle "Zum Warenkorb"-Buttons
    const addToCartButtons = document.querySelectorAll('.product-card .btn');
    console.log(`${addToCartButtons.length} Warenkorb-Buttons gefunden`);
    
    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productCard = this.closest('.product-card');
            const bgStyle = productCard.querySelector('.product-image').style.backgroundImage;
            
            const product = {
                id: productCard.getAttribute('data-id') || `prod-${Date.now()}`,
                name: productCard.querySelector('.product-name').textContent.trim(),
                price: productCard.querySelector('.product-price').textContent
                           .replace('€','')
                           .replace('.','')
                           .replace(',','.'),
                image: bgStyle.substring(5, bgStyle.length - 2),
                quantity: 1
            };
            
            console.log("Produkt hinzugefügt:", product);
            addToCart(product);
        });
    });
    
    function addToCart(product) {
        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if(existingIndex >= 0) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        
        localStorage.setItem('alsafa-cart', JSON.stringify(cart));
        updateCartCounter();
        alert(`${product.name} wurde zum Warenkorb hinzugefügt!`);
    }
    
    function updateCartCounter() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
        console.log("Warenkorb aktualisiert. Anzahl:", count);
    }
    
    // Initialen Counter setzen
    updateCartCounter();
});