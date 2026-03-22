//============================================
// BA FOOD STUDIO - MAIN JAVASCRIPT
// Cart, Animations, Navigation
// ============================================

// --- SUPABASE CONFIG ---
const supabaseUrl = 'https://xbmlpqkjmyldamhtzsgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibWxwcWtqbXlsZGFtaHR6c2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5NDQ2NjEsImV4cCI6MjA4OTUyMDY2MX0._NvGgoP4bbLKRm8QJKN0mY985C-SRIttbqMKyaMPj20';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- APP CONFIG ---
const empresaId = 1;
const pageSize = 10;
let currentPage = 0;
let currentCategory = 'all';
let currentSearch = '';
let hasMore = true;

// --- CART STATE ---
const cart = [];



// --- DOM ELEMENTS ---
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const menuSearch = document.getElementById('menuSearch');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadMoreContainer = document.getElementById('loadMoreContainer');


// ============================================
// CART FUNCTIONS
// ============================================

/**
 * Add an item to the cart or increment its quantity.
 * @param {string} name - Product name.
 * @param {number} price - Product price in ARS.
 */
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }

    updateCartUI();
    animateCartCount();
}


/**
 * Remove one unit of an item or remove it entirely.
 * @param {string} name - Product name.
 */
function removeFromCart(name) {
    const index = cart.findIndex(item => item.name === name);
    if (index === -1) return;

    if (cart[index].qty > 1) {
        cart[index].qty -= 1;
    } else {
        cart.splice(index, 1);
    }

    updateCartUI();
}

/**
 * Increment the quantity of a cart item.
 * @param {string} name - Product name.
 */
function incrementItem(name) {
    const item = cart.find(i => i.name === name);
    if (item) {
        item.qty += 1;
        updateCartUI();
    }
}

/** Update the cart sidebar UI to reflect current state. */
function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío</p>';
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>$${item.price.toLocaleString('es-AR')}</span>
                </div>
                <div class="cart-item-controls">
                    <button onclick="removeFromCart('${item.name}')" aria-label="Quitar uno">−</button>
                    <span class="cart-item-qty">${item.qty}</span>
                    <button onclick="incrementItem('${item.name}')" aria-label="Agregar uno">+</button>
                </div>
            </div>
        `).join('');
        cartFooter.style.display = 'block';
    }

    cartTotal.textContent = `$${totalPrice.toLocaleString('es-AR')}`;
}

/** Animate the cart count badge. */
function animateCartCount() {
    cartCount.classList.remove('bump');
    void cartCount.offsetWidth; // force reflow
    cartCount.classList.add('bump');
}

// ============================================
// CART SIDEBAR TOGGLE
// ============================================

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ============================================
// WHATSAPP CHECKOUT
// ============================================

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const orderLines = cart.map(item =>
        `• ${item.qty}x ${item.name} — $${(item.price * item.qty).toLocaleString('es-AR')}`
    ).join('\n');

    const message = encodeURIComponent(
        `🍔 *Nuevo Pedido - BA Food Studio*\n\n` +
        `${orderLines}\n\n` +
        `💰 *Total: $${totalPrice.toLocaleString('es-AR')}*\n\n` +
        `📍 Enviar a: [Tu dirección]\n` +
        `¡Gracias!`
    );

    window.open(`https://wa.me/5492914425849?text=${message}`, '_blank');
});


// ============================================
// MOBILE NAVIGATION
// ============================================

mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile nav on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================

let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
}, { passive: true });

// ============================================
// INTERSECTION OBSERVER - FADE IN ANIMATIONS
// ============================================

const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    fadeObserver.observe(el);
});

// ============================================
// SUPABASE DATA FETCHING
// ============================================

/**
 * Fetch products from Supabase with pagination, search and category filters.
 * @param {boolean} append - If true, append products to the current list.
 */
async function loadProducts(append = false) {
    try {
        if (!append) {
            currentPage = 0;
            hasMore = true;
            if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        }

        const start = currentPage * pageSize;
        const end = start + pageSize - 1;

        let query = supabaseClient
            .from('comidas')
            .select('*', { count: 'exact' })
            .eq('empresa_id', empresaId)
            .eq('activo', true)
            .order('id', { ascending: true })
            .range(start, end);

        if (currentCategory !== 'all') {
            query = query.eq('categoria', currentCategory);
        }

        if (currentSearch) {
            query = query.ilike('nombre', `%${currentSearch}%`);
        }

        const { data: comidas, count, error } = await query;

        if (error) throw error;

        hasMore = count > (currentPage + 1) * pageSize;

        renderProducts(comidas, append);

        if (loadMoreContainer) {
            loadMoreContainer.style.display = hasMore ? 'flex' : 'none';
        }

    } catch (error) {
        console.error('Error loading products:', error.message);
        const menuGrid = document.getElementById('menuGrid');
        if (!append) {
            menuGrid.innerHTML = '<p class="error-msg">Error al cargar el menú. Por favor reintenta luego.</p>';
        }
    }
}

/**
 * Render products into the menu grid.
 * @param {Array} products - List of product objects.
 * @param {boolean} append - If true, append to existing HTML.
 */
function renderProducts(products, append = false) {
    const menuGrid = document.getElementById('menuGrid');

    if (!append && (!products || products.length === 0)) {
        menuGrid.innerHTML = '<p class="empty-msg">No se encontraron productos que coincidan con tu búsqueda.</p>';
        return;
    }

    const html = products.map(product => {
        const hasOffer = product.precio_oferta && product.precio_oferta < product.precio;
        const currentPrice = hasOffer ? product.precio_oferta : product.precio;
        const discountPercentage = hasOffer ? Math.round(((product.precio - product.precio_oferta) / product.precio) * 100) : 0;

        return `
            <div class="menu-card fade-in visible" data-category="${product.categoria}">
                <div class="menu-card-img">
                    <img src="${product.imagen_url || 'https://via.placeholder.com/400'}" 
                         alt="${product.nombre}" width="400" height="400" loading="lazy">
                    ${product.etiqueta ? `<span class="menu-badge">${product.etiqueta}</span>` : ''}
                    ${hasOffer ? `<span class="discount-badge">-${discountPercentage}%</span>` : ''}
                </div>
                <div class="menu-card-body">
                    <div class="menu-card-info">
                        <h3>${product.nombre}</h3>
                        <p>${product.descripcion || ''}</p>
                    </div>
                    <div class="menu-card-footer">
                        <div class="price-container">
                            ${hasOffer ? `<span class="menu-price original-price">$${product.precio.toLocaleString('es-AR')}</span>` : ''}
                            <span class="menu-price ${hasOffer ? 'offer-price' : ''}">$${currentPrice.toLocaleString('es-AR')}</span>
                        </div>
                        <button class="btn btn-add" onclick="addToCart('${product.nombre.replace(/'/g, "\\'")}', ${currentPrice})">AGREGAR</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (append) {
        menuGrid.insertAdjacentHTML('beforeend', html);
    } else {
        menuGrid.innerHTML = html;
    }
}

/**
 * Handle category filtering.
 */
function setupCategoryFilters() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentCategory = btn.dataset.category;
            loadProducts(false);
        });
    });
}

/**
 * Handle search functionality with debounce.
 */
let searchTimeout;
menuSearch.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadProducts(false);
    }, 400);
});

/**
 * Handle 'Load More' button.
 */
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    loadProducts(true);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupCategoryFilters();
});

