// ==========================================================================
// LOANY DETALLES - SISTEMA PRINCIPAL & E-COMMERCE CORE
// ==========================================================================

import { PRODUCTS } from '../data/products.js';

const CONFIG = {
  // Número de WhatsApp oficial de la florería Loany Detalles (904156666)
  whatsappNumber: '51904156666',
  currencySymbol: 'S/. ',
  storePickupAddress: 'Galerías Qori Wasi • Stand 218 – 2do piso'
};

// ==========================================================================
// ARREGLOS INSIGNIA PARA EL HERO SHOWCASE
// ==========================================================================
const FLAGSHIP_BOUQUETS = [
  {
    id: 'ramo-buchon-frase',
    name: 'Ramo Buchón 25 Rosas',
    price: 100,
    image: 'assets/products/ramo-buchon-frase.png'
  },
  {
    id: 'ramo-gatito',
    name: 'Ramo Felino de Autor',
    price: 45,
    image: 'assets/products/ramo-gatito.png'
  },
  {
    id: 'ramo-amor-verdadero',
    name: 'Amor Verdadero',
    price: 39,
    image: 'assets/products/ramo-amor-verdadero.png'
  },
  {
    id: 'ramo-eterno-rapunzel',
    name: 'Eterno Rapunzel',
    price: 49,
    image: 'assets/products/ramo-eterno-rapunzel.png'
  }
];

// Estado global de la aplicación
let cart = [];
let currentFilter = 'todos';
let searchQuery = '';
let currentOrderMode = 'delivery'; // 'delivery' | 'recojo'
let flagshipAutoplayTimer = null;
let currentFlagshipIndex = 0;

// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  initHeroFlagship();
  initDatePickers();
  initLiveDemandAlert();
  renderPopularDates();
  renderProducts();
  setupEventListeners();
  updateCartUI();
});

// ==========================================================================
// HERO SHOWCASE & ROTACIÓN DE ARREGLOS INSIGNIA
// ==========================================================================
function initHeroFlagship() {
  const visualWrapper = document.querySelector('.hero-visual-wrapper');
  if (visualWrapper) {
    visualWrapper.addEventListener('mouseenter', stopFlagshipAutoplay);
    visualWrapper.addEventListener('mouseleave', startFlagshipAutoplay);
  }

  // Iniciar rotación automática suave cada 6.5 segundos
  startFlagshipAutoplay();
}

function startFlagshipAutoplay() {
  stopFlagshipAutoplay();
  flagshipAutoplayTimer = setInterval(() => {
    currentFlagshipIndex = (currentFlagshipIndex + 1) % FLAGSHIP_BOUQUETS.length;
    const nextBouquet = FLAGSHIP_BOUQUETS[currentFlagshipIndex];
    if (nextBouquet) {
      applyHeroBouquet(nextBouquet);
    }
  }, 6500);
}

function stopFlagshipAutoplay() {
  if (flagshipAutoplayTimer) {
    clearInterval(flagshipAutoplayTimer);
    flagshipAutoplayTimer = null;
  }
}

function applyHeroBouquet(bouquet) {
  const imgEl = document.getElementById('hero-display-img');
  const titleEl = document.getElementById('hero-price-title');
  const priceEl = document.getElementById('hero-price-amount');
  const pills = document.querySelectorAll('.flagship-btn');

  // Actualizar botones de selección
  pills.forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    if (onclickAttr.includes(bouquet.id)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Animación de transición elegante
  if (imgEl) {
    imgEl.style.opacity = '0';
    imgEl.style.transform = 'translateY(16px) scale(0.95)';

    setTimeout(() => {
      imgEl.src = bouquet.image;
      imgEl.alt = bouquet.name;
      if (titleEl) titleEl.textContent = bouquet.name;
      if (priceEl) priceEl.textContent = `${CONFIG.currencySymbol}${bouquet.price}`;

      imgEl.style.opacity = '1';
      imgEl.style.transform = 'translateY(0) scale(1)';
    }, 250);
  }
}

window.switchHeroBouquet = function(productId) {
  stopFlagshipAutoplay();
  const index = FLAGSHIP_BOUQUETS.findIndex(b => b.id === productId);
  const bouquet = index !== -1 
    ? FLAGSHIP_BOUQUETS[index] 
    : PRODUCTS.find(p => p.id === productId);

  if (bouquet) {
    if (index !== -1) currentFlagshipIndex = index;
    applyHeroBouquet(bouquet);
  }

  // Reiniciar autoplay tras interacción del usuario
  startFlagshipAutoplay();
};

// ==========================================================================
// SELECTOR DE MODALIDAD DEL CARRITO (DELIVERY VS RECOJO EN TIENDA)
// ==========================================================================
window.setOrderMode = function(mode) {
  currentOrderMode = mode;
  const btnDelivery = document.getElementById('btn-mode-delivery');
  const btnRecojo = document.getElementById('btn-mode-recojo');
  const deliveryFields = document.getElementById('cart-delivery-fields');
  const pickupFields = document.getElementById('cart-pickup-fields');

  if (mode === 'delivery') {
    if (btnDelivery) btnDelivery.classList.add('active');
    if (btnRecojo) btnRecojo.classList.remove('active');
    if (deliveryFields) deliveryFields.style.display = 'block';
    if (pickupFields) pickupFields.style.display = 'none';
  } else {
    if (btnRecojo) btnRecojo.classList.add('active');
    if (btnDelivery) btnDelivery.classList.remove('active');
    if (deliveryFields) deliveryFields.style.display = 'none';
    if (pickupFields) pickupFields.style.display = 'block';
  }
};

function initDatePickers() {
  const today = new Date().toISOString().split('T')[0];
  const deliveryDateInput = document.getElementById('delivery-date');
  const pickupDateInput = document.getElementById('pickup-date');

  if (deliveryDateInput) {
    deliveryDateInput.min = today;
    if (!deliveryDateInput.value) deliveryDateInput.value = today;
  }
  if (pickupDateInput) {
    pickupDateInput.min = today;
    if (!pickupDateInput.value) pickupDateInput.value = today;
  }
}

// ==========================================================================
// RENDERIZADO DE PRODUCTOS DEL CATÁLOGO
// ==========================================================================
function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  const filtered = PRODUCTS.filter(p => {
    const matchesCategory = 
      currentFilter === 'todos' || 
      (currentFilter === 'gratis' && p.freeDelivery) ||
      (currentFilter === 'populares' && (p.featured || WEEKLY_POPULAR_IDS.includes(p.id))) ||
      p.category === currentFilter;

    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-catalog-box">
        <h4>No se encontraron arreglos florales</h4>
        <p>Intente con otra búsqueda o explore todas las categorías del catálogo.</p>
        <button onclick="setFilter('todos')" class="btn-primary" style="margin-top: 14px; padding: 10px 22px;">Ver Catálogo Completo</button>
      </div>
    `;
    return;
  }

  // Generación limpia con iconos Font Awesome 6 (cero emojis)
  grid.innerHTML = filtered.map(p => {
    const isQuote = p.isQuoteOnly || p.price === 0;
    const priceDisplay = isQuote
      ? `<span class="product-price quote-price" style="font-size: 0.95rem; color: var(--primary);"><i class="fa-brands fa-whatsapp"></i> A Consultar</span>`
      : `<span class="product-price">${CONFIG.currencySymbol}${p.price}</span>`;
    const pricePrefix = isQuote ? 'Cotización' : 'Precio';
    const waBtnText = isQuote ? 'Cotizar' : 'Pedir';
    const waBtnTitle = isQuote ? 'Cotizar por WhatsApp' : 'Pedir por WhatsApp';
    const addCartTitle = isQuote ? 'Añadir para Cotizar' : 'Añadir al Carrito';

    return `
      <article class="product-card" data-id="${p.id}">
        <div class="product-thumb-container">
          <div class="product-badge-stack">
            ${p.featured ? `<span class="badge-tag badge-popular"><i class="fa-solid fa-fire"></i> Popular</span>` : (p.tag ? `<span class="badge-tag">${p.tag}</span>` : '')}
            ${p.freeDelivery ? `<span class="badge-delivery"><i class="fa-solid fa-truck-fast"></i> Envío Gratis</span>` : ''}
          </div>
          <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy">
          <button class="btn-quick-view" onclick="openProductModal('${p.id}')">
            Detalles del Arreglo
          </button>
        </div>

        <div class="product-body">
          <span class="product-category-label">${p.categoryLabel}</span>
          <h3 class="product-name">${p.name}</h3>

          <div class="product-rating">
            <span class="stars-row">
              <i class="fa-solid fa-star" style="color: #d97706; font-size: 0.72rem;"></i>
              <i class="fa-solid fa-star" style="color: #d97706; font-size: 0.72rem;"></i>
              <i class="fa-solid fa-star" style="color: #d97706; font-size: 0.72rem;"></i>
              <i class="fa-solid fa-star" style="color: #d97706; font-size: 0.72rem;"></i>
              <i class="fa-solid fa-star" style="color: #d97706; font-size: 0.72rem;"></i>
            </span>
            <span class="rating-num">${p.rating}</span>
            <span class="rating-count">(${p.reviewsCount} reseñas)</span>
          </div>

          <p class="product-desc">${p.description}</p>

          <div class="product-footer">
            <div class="product-price-box">
              <span class="product-price-prefix">${pricePrefix}</span>
              ${priceDisplay}
            </div>

            <div class="product-actions">
              <button class="btn-add-cart" title="${addCartTitle}" onclick="addToCart('${p.id}')">
                <i class="fa-solid fa-bag-shopping"></i>
              </button>
              <button class="btn-order-wa" title="${waBtnTitle}" onclick="orderDirectWhatsApp('${p.id}')">
                <i class="fa-brands fa-whatsapp"></i>
                <span>${waBtnText}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Arreglos más populares y demandados de la semana (actualización semanal)
const WEEKLY_POPULAR_IDS = [
  'ramo-buchon-frase',
  'ramo-gatito',
  'ramo-amor-verdadero',
  'ramo-eterno-rapunzel'
];

// ==========================================================================
// RENDERIZADO DINÁMICO DE FECHAS ESPECIALES & RAMOS POPULARES
// ==========================================================================
function renderPopularDates() {
  const container = document.getElementById('special-dates-grid');
  if (!container) return;

  const populars = WEEKLY_POPULAR_IDS
    .map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean);

  container.innerHTML = populars.map(p => `
    <div class="popular-alert-card" onclick="openProductModal('${p.id}')">
      <div class="popular-card-badge">
        <i class="fa-solid fa-fire"></i> ${p.tag || 'Más Pedido'}
      </div>
      <div class="popular-card-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="popular-card-body">
        <span class="popular-card-tag">${p.categoryLabel}</span>
        <h4 class="popular-card-name">${p.name}</h4>
        <div class="popular-card-footer">
          <span class="popular-card-price" style="font-size: 1.05rem; font-weight: 700; color: var(--primary);">
            ${CONFIG.currencySymbol}${p.price.toFixed(2)}
          </span>
          <button type="button" class="btn-popular-action" onclick="event.stopPropagation(); orderDirectWhatsApp('${p.id}')">
            <i class="fa-brands fa-whatsapp"></i>
            <span>Pedir</span>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================================================
// FILTROS Y CATEGORÍAS (TRANSICIÓN VISUAL SUAVE CON FADE-IN)
// ==========================================================================
window.setFilter = function(filterCategory) {
  currentFilter = filterCategory;
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filterCategory);
  });

  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.classList.add('is-filtering');
    setTimeout(() => {
      renderProducts();
      grid.classList.remove('is-filtering');
    }, 120);
  } else {
    renderProducts();
  }

  const catalogEl = document.getElementById('catalogo');
  if (catalogEl && (window.scrollY > catalogEl.offsetTop + 400 || window.scrollY < catalogEl.offsetTop - 300)) {
    catalogEl.scrollIntoView({ behavior: 'smooth' });
  }
};

window.filterByOccasion = function(occasionName) {
  if (occasionName.includes('Amor') || occasionName.includes('Aniversario')) {
    setFilter('buchones');
  } else if (occasionName.includes('Eterno')) {
    setFilter('eternos');
  } else if (occasionName.includes('Adicional') || occasionName.includes('Sorpresa')) {
    setFilter('adicionales');
  } else {
    setFilter('naturales');
  }
  showToast(`Filtrando catálogo para: ${occasionName}`);
};

// ==========================================================================
// GESTIÓN DEL CARRITO DE COMPRAS & STORAGE
// ==========================================================================
window.addToCart = function(productId, showDrawer = true) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      isQuoteOnly: !!(product.isQuoteOnly || product.price === 0),
      image: product.image,
      categoryLabel: product.categoryLabel,
      freeDelivery: product.freeDelivery,
      quantity: 1
    });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`«${product.name}» añadido al pedido`);

  if (showDrawer) {
    openCartDrawer();
  }
};

window.updateCartQuantity = function(productId, delta) {
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;
  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  saveCartToStorage();
  updateCartUI();
};

window.removeFromCart = function(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCartToStorage();
  updateCartUI();
  showToast('Artículo retirado del pedido');
};

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasQuoteOnly = cart.some(item => item.isQuoteOnly || item.price === 0);

  const counters = document.querySelectorAll('.cart-counter-value');
  counters.forEach(el => el.textContent = totalItems);

  const totalEl = document.getElementById('cart-total');
  if (totalEl) {
    if (subtotal > 0 && hasQuoteOnly) {
      totalEl.innerHTML = `${CONFIG.currencySymbol}${subtotal.toFixed(2)} <span style="font-size: 0.74rem; color: var(--primary); display: block; font-weight: 600;">(+ detalles por cotizar)</span>`;
    } else if (subtotal === 0 && hasQuoteOnly) {
      totalEl.innerHTML = `<span style="font-size: 0.95rem; color: var(--primary);"><i class="fa-brands fa-whatsapp"></i> A cotizar por WhatsApp</span>`;
    } else {
      totalEl.textContent = `${CONFIG.currencySymbol}${subtotal.toFixed(2)}`;
    }
  }

  const drawerItems = document.getElementById('cart-drawer-items');
  const btnCheckout = document.getElementById('btn-checkout-wa');
  const cartFooter = document.getElementById('cart-drawer-footer');
  if (!drawerItems) return;

  if (cart.length === 0) {
    if (cartFooter) cartFooter.style.display = 'none';
    drawerItems.innerHTML = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-basket-shopping" style="font-size: 2.8rem; color: #ab9aa1; margin: 0 auto 14px; display: block;"></i>
        <h4>Su carrito se encuentra vacío</h4>
        <p>Explore nuestro catálogo para seleccionar el detalle floral de su preferencia.</p>
        <button onclick="closeCartDrawer(); setFilter('todos');" class="btn-primary" style="margin-top: 16px; padding: 10px 22px;">Explorar Arreglos</button>
      </div>
    `;
    if (btnCheckout) {
      btnCheckout.disabled = true;
      btnCheckout.style.opacity = '0.5';
      btnCheckout.style.pointerEvents = 'none';
    }
  } else {
    if (cartFooter) cartFooter.style.display = 'block';
    if (btnCheckout) {
      btnCheckout.disabled = false;
      btnCheckout.style.opacity = '1';
      btnCheckout.style.pointerEvents = 'auto';
    }

    drawerItems.innerHTML = cart.map(item => {
      const isQuote = item.isQuoteOnly || item.price === 0;
      const priceDisplay = isQuote
        ? `<div class="cart-item-price" style="color: var(--primary); font-size: 0.82rem;"><i class="fa-brands fa-whatsapp"></i> A consultar</div>`
        : `<div class="cart-item-price">${CONFIG.currencySymbol}${item.price} c/u</div>`;

      return `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h5 class="cart-item-title">${item.name}</h5>
          ${priceDisplay}
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)" aria-label="Disminuir">−</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)" aria-label="Aumentar">+</button>
          </div>
        </div>
        <button class="cart-item-remove" title="Eliminar artículo" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
    }).join('');
  }
}

function saveCartToStorage() {
  try { localStorage.setItem('loany_cart_v2', JSON.stringify(cart)); } catch (e) {}
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('loany_cart_v2');
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
}

window.openMobileNav = function() {
  const overlay = document.getElementById('mobile-nav-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  const elAlert = document.getElementById('live-popular-alert');
  if (elAlert) elAlert.classList.remove('show');
};

window.closeMobileNav = function() {
  const overlay = document.getElementById('mobile-nav-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.openCartDrawer = function() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  const elAlert = document.getElementById('live-popular-alert');
  if (elAlert) elAlert.classList.remove('show');
};

window.closeCartDrawer = function() {
  const overlay = document.getElementById('cart-drawer-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ==========================================================================
// WHATSAPP CHECKOUT FORMAL CON DATOS DE ENTREGA / RECOJO
// ==========================================================================
window.checkoutViaWhatsApp = function() {
  if (cart.length === 0) {
    showToast('Su carrito se encuentra vacío');
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const hasQuoteOnly = cart.some(item => item.isQuoteOnly || item.price === 0);
  const dedicationInput = document.getElementById('cart-dedication');
  const dedicationText = dedicationInput ? dedicationInput.value.trim() : '';

  // Formato del resumen de productos
  const itemsListText = cart.map(item => {
    if (item.isQuoteOnly || item.price === 0) {
      return `• ${item.quantity}x ${item.name} (Precio a cotizar / Edición en tendencia)`;
    }
    return `• ${item.quantity}x ${item.name} (${CONFIG.currencySymbol}${item.price} c/u) = ${CONFIG.currencySymbol}${item.price * item.quantity}`;
  }).join('\n');

  let totalText = `${CONFIG.currencySymbol}${subtotal.toFixed(2)}`;
  if (subtotal > 0 && hasQuoteOnly) {
    totalText += ' (+ detalles en tendencia a cotizar por WhatsApp)';
  } else if (subtotal === 0 && hasQuoteOnly) {
    totalText = 'A cotizar por WhatsApp (Edición en tendencia)';
  }

  let orderDetailsSection = '';

  if (currentOrderMode === 'delivery') {
    const nameInput = document.getElementById('delivery-name');
    const phoneInput = document.getElementById('delivery-phone');
    const dateInput = document.getElementById('delivery-date');
    const addressInput = document.getElementById('delivery-address');
    const refInput = document.getElementById('delivery-ref');
    const timeSelect = document.getElementById('delivery-time');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';
    const address = addressInput ? addressInput.value.trim() : '';
    const ref = refInput ? refInput.value.trim() : '';
    const time = timeSelect ? timeSelect.value : 'A coordinar';

    // Validación básica de campos indispensables
    if (!name) {
      if (nameInput) {
        nameInput.focus();
        nameInput.style.borderColor = '#c026d3';
      }
      showToast('Por favor ingrese el nombre de quien recibe');
      return;
    }

    if (!address) {
      if (addressInput) {
        addressInput.focus();
        addressInput.style.borderColor = '#c026d3';
      }
      showToast('Por favor ingrese la dirección exacta de entrega');
      return;
    }

    orderDetailsSection = 
`MODALIDAD: Entrega por Delivery a Domicilio
• Destinatario: ${name}
• Celular de contacto: ${phone || 'Por confirmar'}
• Dirección: ${address}
${ref ? `• Referencia: ${ref}` : ''}
• Fecha de entrega: ${date || 'A convenir'}
• Horario preferente: ${time}`;

  } else {
    // Modo Recojo en Tienda
    const nameInput = document.getElementById('pickup-name');
    const phoneInput = document.getElementById('pickup-phone');
    const dateInput = document.getElementById('pickup-date');
    const timeSelect = document.getElementById('pickup-time');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const date = dateInput ? dateInput.value : '';
    const time = timeSelect ? timeSelect.value : 'A coordinar';

    if (!name) {
      if (nameInput) {
        nameInput.focus();
        nameInput.style.borderColor = '#c026d3';
      }
      showToast('Por favor ingrese el nombre de la persona que retira');
      return;
    }

    orderDetailsSection = 
`MODALIDAD: Recojo en Tienda
• Punto de entrega: ${CONFIG.storePickupAddress}
• Persona que recoge: ${name}
• Celular de contacto: ${phone || 'Por confirmar'}
• Fecha estimada: ${date || 'A convenir'}
• Horario estimado: ${time}`;
  }

  const dedicationSection = dedicationText 
    ? `TARJETA DEDICATORIA:\n"${dedicationText}"` 
    : `TARJETA DEDICATORIA:\n(Sin dedicatoria adicional / Coordinar por chat)`;

  const fullMessage = 
`Estimados Loany Detalles,
Deseo formalizar el siguiente pedido desde su plataforma web:

RESUMEN DEL PEDIDO:
${itemsListText}

TOTAL ESTIMADO: ${totalText}

${orderDetailsSection}

${dedicationSection}

Quedo a la espera de su confirmación para proceder con el abono vía Yape / Plin / Transferencia. Muchas gracias.`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;
  window.open(url, '_blank');
};

// ==========================================================================
// CONSULTA RÁPIDA DE PRODUCTO INDIVIDUAL POR WHATSAPP
// ==========================================================================
window.orderDirectWhatsApp = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const isQuote = product.isQuoteOnly || product.price === 0;

  let msg = '';
  if (isQuote) {
    msg = 
`Estimados Loany Detalles,
Deseo consultar precio, disponibilidad y opciones de entrega del siguiente detalle en tendencia:

• Producto: ${product.name}
• Categoría: ${product.categoryLabel}
• Referencia: Edición Popular / En Tendencia
• Descripción: ${product.description}

Agradeceré me brinden la cotización correspondiente y los detalles para realizar el pedido. Muchas gracias.`;
  } else {
    msg = 
`Estimados Loany Detalles,
Deseo consultar disponibilidad y confirmar el siguiente arreglo floral:

• Producto: ${product.name}
• Precio: ${CONFIG.currencySymbol}${product.price}
• Características: ${product.description}
${product.freeDelivery ? '• Beneficio: Envío incluido en zonas céntricas' : ''}

Agradeceré me brinden los detalles para la entrega y los datos de pago. Muchas gracias.`;
  }

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

// ==========================================================================
// MODAL DE DETALLES DEL PRODUCTO
// ==========================================================================
window.openProductModal = function(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  const modalOverlay = document.getElementById('product-modal-overlay');
  if (!product || !modalOverlay) return;

  // Ocultar alerta emergente para no competir ni tapar botones
  const elAlert = document.getElementById('live-popular-alert');
  if (elAlert) elAlert.classList.remove('show');

  const isQuote = product.isQuoteOnly || product.price === 0;

  document.getElementById('modal-img').src = product.image;
  document.getElementById('modal-img').alt = product.name;
  document.getElementById('modal-title').textContent = product.name;

  const modalPriceEl = document.getElementById('modal-price');
  if (modalPriceEl) {
    if (isQuote) {
      modalPriceEl.innerHTML = `<span style="font-size: 1.15rem; color: var(--primary); font-weight: 700;"><i class="fa-brands fa-whatsapp"></i> Precio a consultar por WhatsApp</span>`;
    } else {
      modalPriceEl.textContent = `${CONFIG.currencySymbol}${product.price}`;
    }
  }

  document.getElementById('modal-category').textContent = product.categoryLabel;
  document.getElementById('modal-desc').textContent = product.description;

  const featuresList = document.getElementById('modal-features');
  if (featuresList) {
    featuresList.innerHTML = (product.flowers || []).map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('');
  }

  const btnAdd = document.getElementById('modal-btn-add');
  const btnWa = document.getElementById('modal-btn-wa');

  if (btnAdd) {
    btnAdd.innerHTML = isQuote 
      ? `<i class="fa-solid fa-bag-shopping"></i> <span>Añadir para Cotizar</span>`
      : `<i class="fa-solid fa-bag-shopping"></i> <span>Añadir al Carrito</span>`;
    btnAdd.onclick = () => {
      addToCart(product.id, true);
      closeProductModal();
    };
  }

  if (btnWa) {
    btnWa.innerHTML = isQuote
      ? `<i class="fa-brands fa-whatsapp"></i> <span>Cotizar por WhatsApp</span>`
      : `<i class="fa-brands fa-whatsapp"></i> <span>Pedir Directo</span>`;
    btnWa.onclick = () => {
      orderDirectWhatsApp(product.id);
    };
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeProductModal = function() {
  const modalOverlay = document.getElementById('product-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// ==========================================================================
// NOTIFICACIONES TOAST
// ==========================================================================
function showToast(message) {
  const toast = document.getElementById('toast-notice');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// ==========================================================================
// EVENT LISTENERS & UI
// ==========================================================================
function setupEventListeners() {
  // Tabs de filtrado
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => setFilter(tab.dataset.filter));
  });

  // Búsqueda en vivo
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  // Botón formalizar pedido WhatsApp
  const btnCheckout = document.getElementById('btn-checkout-wa');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', checkoutViaWhatsApp);
  }

  // Restaurar bordes al escribir en inputs con error
  const inputsToMonitor = [
    'delivery-name', 'delivery-address', 'delivery-phone', 
    'pickup-name', 'pickup-phone'
  ];
  inputsToMonitor.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.style.borderColor = '';
      });
    }
  });

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (header) {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Barra de anuncios
  const announcementClose = document.querySelector('.announcement-close');
  const announcementBar = document.querySelector('.announcement-bar');
  if (announcementClose && announcementBar) {
    announcementClose.addEventListener('click', () => {
      announcementBar.style.display = 'none';
    });
  }

  // Escape para cerrar drawers y modales
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
      closeCartDrawer();
      closeProductModal();
    }
  });

  // Cerrar menú móvil si se redimensiona a pantalla de escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1180) {
      closeMobileNav();
    }
  });

  // Formulario promocional
  const promoForm = document.getElementById('promo-form');
  if (promoForm) {
    promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('promo-email');
      if (emailInput && emailInput.value) {
        showToast('Código promocional LOANY10 aplicado exitosamente');
        emailInput.value = '';
      }
    });
  }
}

// ==========================================================================
// ALERTA DE PRODUCTO POPULAR / FECHAS ESPECIALES (SOCIAL PROOF DINÁMICO)
// ==========================================================================
const POPULAR_DEMAND_ITEMS = [
  {
    id: 'ramo-buchon-frase',
    title: 'Ramo Buchón con Frase Personalizada',
    text: '25 rosas de exportación con mensaje grabado en cinta. Más pedido de la semana.',
    image: 'assets/products/ramo-buchon-frase.png'
  },
  {
    id: 'ramo-gatito',
    title: 'Ramo Gatito de Autor',
    text: 'Girasoles frescos y tierno peluche gatito. Tendencia de la semana.',
    image: 'assets/products/ramo-gatito.png'
  },
  {
    id: 'ramo-amor-verdadero',
    title: 'Ramo Amor Verdadero',
    text: 'Combinación romántica de rosas rojas y flores selectas con envío incluido.',
    image: 'assets/products/ramo-amor-verdadero.png'
  },
  {
    id: 'ramo-eterno-rapunzel',
    title: 'Ramo Eterno Rapunzel',
    text: 'Arreglo floral permanente tejido a mano en tonos gala lila y dorado.',
    image: 'assets/products/ramo-eterno-rapunzel.png'
  }
];

let demandAlertTimer = null;
let currentDemandIndex = 0;
let demandAlertDismissed = false;
let demandAutoHideTimer = null;

function initLiveDemandAlert() {
  const elAlert = document.getElementById('live-popular-alert');
  if (!elAlert) return;

  // Pausar en hover para permitir lectura cómoda
  elAlert.addEventListener('mouseenter', () => {
    if (demandAutoHideTimer) { clearTimeout(demandAutoHideTimer); demandAutoHideTimer = null; }
    if (demandAlertTimer) clearTimeout(demandAlertTimer);
  });
  elAlert.addEventListener('mouseleave', () => {
    if (!demandAlertDismissed) {
      scheduleNextDemandAlert();
    }
  });

  // Primera aparición moderada a los 22 segundos para no saturar al entrar
  setTimeout(() => {
    if (!demandAlertDismissed) {
      showNextDemandAlert();
    }
  }, 22000);
}

function scheduleNextDemandAlert() {
  if (demandAlertTimer) clearTimeout(demandAlertTimer);
  demandAlertTimer = setTimeout(() => {
    if (!demandAlertDismissed) {
      showNextDemandAlert();
    }
  }, 45000); // Espaciado amplio a 45 segundos para no estorbar
}

function showNextDemandAlert() {
  if (demandAlertDismissed) return;
  const elAlert = document.getElementById('live-popular-alert');
  if (!elAlert) return;

  // Si el usuario tiene abierto un modal o el carrito, no mostrar alertas
  if (document.body.style.overflow === 'hidden') {
    scheduleNextDemandAlert();
    return;
  }

  const item = POPULAR_DEMAND_ITEMS[currentDemandIndex];
  currentDemandIndex = (currentDemandIndex + 1) % POPULAR_DEMAND_ITEMS.length;

  const elImg = document.getElementById('demand-img');
  const elTitle = document.getElementById('demand-title');
  const elText = document.getElementById('demand-text');
  const elBtn = document.getElementById('demand-view-btn');

  if (elImg) {
    elImg.src = item.image;
    elImg.alt = item.title;
  }
  if (elTitle) elTitle.textContent = item.title;
  if (elText) elText.textContent = item.text;
  if (elBtn) {
    elBtn.onclick = () => {
      openProductModal(item.id);
    };
  }

  elAlert.classList.add('show');

  // Auto-ocultar después de 5 segundos si el usuario no interactúa
  if (demandAutoHideTimer) clearTimeout(demandAutoHideTimer);
  demandAutoHideTimer = setTimeout(() => {
    if (!demandAlertDismissed && elAlert.classList.contains('show')) {
      elAlert.classList.remove('show');
      // Programar la siguiente aparición amplia
      scheduleNextDemandAlert();
    }
  }, 5000);
}

window.dismissLiveDemandAlert = function() {
  demandAlertDismissed = true;
  const elAlert = document.getElementById('live-popular-alert');
  if (elAlert) elAlert.classList.remove('show');
  if (demandAlertTimer) {
    clearTimeout(demandAlertTimer);
    demandAlertTimer = null;
  }
  if (demandAutoHideTimer) {
    clearTimeout(demandAutoHideTimer);
    demandAutoHideTimer = null;
  }
};

