/* ══════════════════════════════════════
   FLUX KICKS — script.js
   ══════════════════════════════════════ */

// ── MOBILE MENU ──
function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('open');
}
function closeMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
}

// ── MODAL ──
function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    switchTab('signup');
}
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
    clearErrors();
}
function handleOverlayClick(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
});

// ── TABS ──
function switchTab(tab) {
    ['formSignup','formLogin','formSuccess'].forEach(id =>
        document.getElementById(id).classList.add('hidden'));
    ['tabSignup','tabLogin'].forEach(id =>
        document.getElementById(id).classList.remove('active'));
    if (tab === 'signup') {
        document.getElementById('formSignup').classList.remove('hidden');
        document.getElementById('tabSignup').classList.add('active');
    } else if (tab === 'login') {
        document.getElementById('formLogin').classList.remove('hidden');
        document.getElementById('tabLogin').classList.add('active');
    }
    clearErrors();
}

// ── VALIDATION ──
function isValidEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
function isValidPhone(val) { return /^[\+]?[0-9\s\-\(\)]{7,15}$/.test(val); }
function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
}

// ── SIGN UP ──
function handleSignup() {
    const name     = document.getElementById('signupName').value.trim();
    const contact  = document.getElementById('signupContact').value.trim();
    const password = document.getElementById('signupPassword').value;
    const errorEl  = document.getElementById('signupError');
    if (!name)    { errorEl.textContent = 'Введи своё имя'; return; }
    if (!contact) { errorEl.textContent = 'Введи email или номер телефона'; return; }
    if (!isValidEmail(contact) && !isValidPhone(contact)) {
        errorEl.textContent = 'Введи корректный email или номер телефона'; return;
    }
    if (password.length < 6) { errorEl.textContent = 'Пароль должен быть минимум 6 символов'; return; }
    const users = JSON.parse(localStorage.getItem('fluxUsers') || '[]');
    if (users.find(u => u.contact === contact)) {
        errorEl.textContent = 'Аккаунт с таким email/номером уже существует'; return;
    }
    users.push({ name, contact, password });
    localStorage.setItem('fluxUsers', JSON.stringify(users));
    document.getElementById('successMsg').textContent = `Привет, ${name}! Аккаунт создан. Добро пожаловать в FLUX KICKS!`;
    showSuccess();
}

// ── LOGIN ──
function handleLogin() {
    const contact  = document.getElementById('loginContact').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl  = document.getElementById('loginError');
    if (!contact)  { errorEl.textContent = 'Введи email или номер телефона'; return; }
    if (!password) { errorEl.textContent = 'Введи пароль'; return; }
    const users = JSON.parse(localStorage.getItem('fluxUsers') || '[]');
    const user  = users.find(u => u.contact === contact && u.password === password);
    if (!user) { errorEl.textContent = 'Неверный email/номер или пароль'; return; }
    document.getElementById('successMsg').textContent = `С возвращением, ${user.name}! Рады видеть тебя снова.`;
    showSuccess();
}

function showSuccess() {
    ['formSignup','formLogin','formSuccess'].forEach(id =>
        document.getElementById(id).classList.add('hidden'));
    document.getElementById('formSuccess').classList.remove('hidden');
    ['tabSignup','tabLogin'].forEach(id =>
        document.getElementById(id).classList.remove('active'));
}

// ── TOGGLE PASSWORD ──
function togglePass(inputId, btn) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.style.opacity = input.type === 'text' ? '1' : '0.5';
}

/* ══════════════════════════════════════
   CART
   ══════════════════════════════════════ */
let cart = JSON.parse(localStorage.getItem('fluxCart') || '[]');

function saveCart() {
    localStorage.setItem('fluxCart', JSON.stringify(cart));
}

function updateCartUI() {
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const count = cart.reduce((s, i) => s + i.qty, 0);

    ['cartCount','cartCountMob'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        }
    });

    const cartItemsEl  = document.getElementById('cartItems');
    const cartEmptyEl  = document.getElementById('cartEmpty');
    const cartFooterEl = document.getElementById('cartFooter');
    const cartTotalEl  = document.getElementById('cartTotal');
    if (!cartItemsEl) return;

    const existing = cartItemsEl.querySelectorAll('.cart-item');
    existing.forEach(e => e.remove());

    if (cart.length === 0) {
        cartEmptyEl.style.display = 'flex';
        cartFooterEl.style.display = 'none';
    } else {
        cartEmptyEl.style.display = 'none';
        cartFooterEl.style.display = 'block';
        cartTotalEl.textContent = '$' + total;

        cart.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="changeQty(${idx}, -1)">−</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty(${idx}, 1)">+</button>
                    <button class="remove-btn" onclick="removeItem(${idx})">✕</button>
                </div>
            `;
            cartItemsEl.appendChild(div);
        });
    }
}

function addToCart(name, price, btn) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    saveCart();
    updateCartUI();

    if (btn) {
        const orig = btn.textContent;
        btn.textContent = '✓ Added!';
        btn.style.background = '#22c55e';
        setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = '';
        }, 1200);
    }

    openCart();
}

function changeQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    updateCartUI();
}

function removeItem(idx) {
    cart.splice(idx, 1);
    saveCart();
    updateCartUI();
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function checkout() {
    alert('Функция оформления заказа будет добавлена! 🛍️');
}

function openCart() {
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCartUI();
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function handleCartOverlayClick(e) {
    if (e.target === document.getElementById('cartOverlay')) closeCart();
}




function filterArrivals(cat, btn) {
    document.querySelectorAll('.arrivals-nav .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('#arrivalsGrid .product-card');
    cards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.style.display = match ? '' : 'none';
    });
}




const SHOP_PRODUCTS = [
    // ── Страница 1
    { name: 'Asics blue 2026',      brand: 'Asics', price: 189, img: 'img/WhatsApp Image 2026-04-29 at 10.43.55.jpeg',             badge: 'ЖАҢА',  cat: 'sneakers' },
    { name: 'Asics Ultra Boost X',  brand: 'Asics', price: 159, img: 'img/WhatsApp Image 2026-04-29 at 10.43.54 (1)-Photoroom.png', badge: 'ЖАҢА',  cat: 'casual'   },
    { name: 'Asics Premium Boot',   brand: 'Asics', price: 149, img: 'img/WhatsApp Image 2026-04-29 at 10.43.55 (1).jpeg',          badge: 'САТУ', badgeSale: true, cat: 'boots' },
    { name: 'Asics Classic',        brand: 'Asics', price: 175, img: 'img/WhatsApp Image 2026-04-29 at 10.43.55 (2).jpeg',          badge: '',     cat: 'sneakers' },
    { name: 'Asics Retro',          brand: 'Asics', price: 210, img: 'img/WhatsApp Image 2026-04-29 at 10.43.55 (3).jpeg',          badge: 'НАУКАН',  cat: 'sport'    },
    { name: 'Asics Classic XXI',    brand: 'Asics', price: 99,  img: 'img/WhatsApp Image 2026-04-29 at 10.43.56.jpeg',              badge: 'САТУ', badgeSale: true, cat: 'casual' },

    // ── Страница 2
    { name: 'Asics Low Retro',          brand: 'Asics',       price: 115, img: 'img/2img/WhatsApp Image 2026-04-29 at 12.53.34.jpeg', badge: 'ЖАҢА',  cat: 'sneakers' },
    { name: 'Asics 350 V2',             brand: 'Asics',       price: 230, img: 'img/2img/WhatsApp Image 2026-04-29 at 12.53.40.jpeg', badge: 'НАУКАН',  cat: 'sneakers' },
    { name: 'Asics 70',                 brand: 'Asics',       price: 95,  img: 'img/2img/WhatsApp Image 2026-04-29 at 12.53.47.jpeg', badge: '',     cat: 'casual'   },
    { name: 'Asics Old Skool Pro',      brand: 'Asics',       price: 85,  img: 'img/2img/WhatsApp Image 2026-04-29 at 12.53.57.jpeg', badge: '',     cat: 'casual'   },
    { name: 'Asics Classic Leather',    brand: 'Asics',       price: 110, img: 'img/2img/WhatsApp Image 2026-04-29 at 12.54.08.jpeg', badge: 'САТУ', badgeSale: true, cat: 'sport' },
    { name: 'Asics XT-6',               brand: 'Asics',       price: 190, img: 'img/2img/WhatsApp Image 2026-04-29 at 12.54.19.jpeg', badge: 'ЖАҢА',  cat: 'sport'    },

    // ── Страница 3 ──
    { name: 'Asics 1 Low',              brand: 'Asics',        price: 120, img: 'img/3img/WhatsApp Image 2026-04-30 at 08.50.14 (1).jpeg',  badge: '',     cat: 'sneakers' },
    { name: 'Asics Stan Smith',         brand: 'Asics',        price: 100, img: 'img/3img/WhatsApp Image 2026-04-30 at 08.50.14 (2).jpeg',  badge: '',     cat: 'casual'   },
    { name: 'Asics 1460',               brand: 'Asics',        price: 165, img: 'img/3img/WhatsApp Image 2026-04-30 at 08.50.14.jpeg',      badge: 'ЖАҢА',  cat: 'boots'    },
    { name: 'Asics Gel-Kayano 30',      brand: 'Asics',        price: 145, img: 'img/3img/WhatsApp Image 2026-04-30 at 08.50.15 (1).jpeg',  badge: '',     cat: 'sport'    },
    { name: 'Asics 4 Retro',            brand: 'Asics',        price: 250, img: 'img/3img/WhatsApp Image 2026-04-30 at 08.50.15 (2).jpeg',  badge: 'НАУКАН',  cat: 'sport'    },
    { name: 'Asics 574',                brand: 'Asics',        price: 95,  img: 'img/3img/WhatsApp Image 2026-04-30 at 08.50.15.jpeg',      badge: 'САТУ', badgeSale: true, cat: 'casual' },
];

const ITEMS_PER_PAGE = 6;
let shopCurrentPage = 1;
let shopActiveFilter = 'all';

function getFilteredProducts() {
    if (shopActiveFilter === 'all') return SHOP_PRODUCTS;
    return SHOP_PRODUCTS.filter(p => p.cat === shopActiveFilter);
}

function renderShopPage() {
    const grid = document.getElementById('shopGrid');
    if (!grid) return;

    const filtered = getFilteredProducts();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    shopCurrentPage = Math.min(shopCurrentPage, totalPages || 1);

    const start = (shopCurrentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    grid.innerHTML = '';
    pageItems.forEach(item => {
        const badgeHTML = item.badge
            ? `<span class="card-badge ${item.badgeSale ? 'card-badge--sale' : ''}">${item.badge}</span>`
            : '';


        const imgHTML = item.img
            ? `<img src="${item.img}" alt="${item.name}" class="card-photo">`
            : `<div class="card-no-photo"><span>👟</span></div>`;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.cat = item.cat;
        card.innerHTML = `
            <div class="card-img">
                ${badgeHTML}
                ${imgHTML}
            </div>
            <div class="card-body">
                <div class="card-brand">${item.brand}</div>
                <div class="card-name">${item.name}</div>
                <div class="card-row">
                    <div class="card-price">$${item.price}</div>
                    <button class="card-btn" onclick="addToCart('${item.name}', ${item.price}, this)">Себетке қосу</button>
                </div>
                <div class="card-sizes">Өлшемдері: 38 – 46</div>
            </div>
        `;
        grid.appendChild(card);
    });

    const countEl = document.getElementById('shopCount');
    if (countEl) countEl.textContent = filtered.length + ' товаров';

    const dotsEl = document.getElementById('pageDots');
    if (dotsEl) {
        dotsEl.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const dot = document.createElement('button');
            dot.className = 'page-dot' + (i === shopCurrentPage ? ' active' : '');
            dot.textContent = i;
            dot.onclick = () => { shopCurrentPage = i; renderShopPage(); };
            dotsEl.appendChild(dot);
        }
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.disabled = shopCurrentPage <= 1;
    if (nextBtn) nextBtn.disabled = shopCurrentPage >= totalPages;

    grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function changePage(delta) {
    const filtered = getFilteredProducts();
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    shopCurrentPage = Math.max(1, Math.min(shopCurrentPage + delta, totalPages));
    renderShopPage();
}

function shopFilter(cat, btn) {
    document.querySelectorAll('.shop-filters-bar .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    shopActiveFilter = cat;
    shopCurrentPage = 1;
    renderShopPage();
}

if (document.getElementById('shopGrid')) {
    renderShopPage();
}

updateCartUI();

/* ══════════════════════════════════════
   SCROLL REVEAL
   ══════════════════════════════════════ */
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('sr--visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.sr, .sr-left, .sr-right, .sr-scale').forEach(el => {
        observer.observe(el);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}
