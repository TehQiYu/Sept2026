/* Aspec – shared script: cart, home, forms and checkout */
const ICONS = {
  keyboards: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="16" width="56" height="32" rx="6"/><path d="M12 26h4M22 26h4M32 26h4M42 26h4M50 26h2M12 34h2M20 34h2M28 34h2M36 34h2M44 34h2M52 34h0M18 41h28"/></svg>',
  mice: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="19" y="6" width="26" height="52" rx="13"/><path d="M32 6v18M19 24h26"/></svg>',
  audio: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 38V32a22 22 0 0 1 44 0v6"/><rect x="6" y="36" width="12" height="18" rx="5"/><rect x="46" y="36" width="12" height="18" rx="5"/></svg>'
};
const CATS = { keyboards: 'Keyboards', mice: 'Mice', audio: 'Audio' };

const PRODUCTS = [
  { id: 1, name: 'Aspec Forge 75 Keyboard', cat: 'keyboards', price: 329, desc: 'Hot-swappable 75% mechanical keyboard with gasket mount and PBT keycaps.' },
  { id: 2, name: 'Aspec Lite 60 Wireless', cat: 'keyboards', price: 219, desc: 'Compact 60% Bluetooth/2.4GHz board with up to 120 hours of battery life.' },
  { id: 3, name: 'Aspec Glide Pro Mouse', cat: 'mice', price: 189, desc: '59g ultralight wireless gaming mouse with a 26K DPI sensor.' },
  { id: 4, name: 'Aspec Flow Ergo Mouse', cat: 'mice', price: 149, desc: 'Vertical ergonomic mouse that keeps your wrist neutral all day.' },
  { id: 5, name: 'Aspec Pulse Headset', cat: 'audio', price: 259, desc: 'Wireless headset with 50mm drivers, ANC and a detachable boom mic.' },
  { id: 6, name: 'Aspec Buds Air', cat: 'audio', price: 139, desc: 'Low-latency earbuds with 30-hour case battery and USB-C charging.' }
];

const RM = n => 'RM ' + n.toLocaleString('en-MY');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

let cart = [];
try { cart = JSON.parse(localStorage.getItem('aspec_cart')) || []; } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem('aspec_cart', JSON.stringify(cart)); } catch (e) {} };

function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  toast('Added to cart');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const box = $('#drawer-items');
  if (!box) return;

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $$('.cart-count').forEach(node => node.textContent = count);

  let total = 0;
  if (!cart.length) {
    box.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Browse the shop to add something.</div>';
  } else {
    box.innerHTML = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      total += product.price * item.qty;
      return `
        <div class="ci">
          <div class="ci-ico">${ICONS[product.cat]}</div>
          <div>
            <h4>${product.name}</h4>
            <small>${RM(product.price)}</small>
            <div class="qty">
              <button aria-label="Decrease" onclick="changeQty(${product.id},-1)">−</button>
              <span>${item.qty}</span>
              <button aria-label="Increase" onclick="changeQty(${product.id},1)">+</button>
            </div>
          </div>
          <button class="ci-remove" onclick="removeItem(${product.id})">Remove</button>
        </div>`;
    }).join('');
  }

  $('#cart-total').textContent = RM(total);
  renderPages();
}

function openCart(isOpen = true) {
  $('#drawer').classList.toggle('open', isOpen);
  $('#overlay').classList.toggle('open', isOpen);
}

function checkout() {
  if (!cart.length) {
    toast('Your cart is empty');
    return;
  }
  location.href = 'checkout.html';
}

function toast(msg) {
  const toastNode = $('#toast');
  toastNode.textContent = msg;
  toastNode.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toastNode.classList.remove('show'), 2200);
}

function initHome() {
  const cats = $('#cats');
  if (!cats) return;

  cats.innerHTML = Object.keys(CATS).map(key => {
    const count = PRODUCTS.filter(product => product.cat === key).length;
    return `<a class="cat-card" href="products.html#${key}">${ICONS[key]}<strong>${CATS[key]}</strong><span>${count} items</span></a>`;
  }).join('');
}

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function initContact() {
  const form = $('#contact-form');
  if (!form) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const rules = {
      name: value => value.trim().length >= 2 || 'Please enter your name.',
      email: value => validEmail(value) || 'Please enter a valid email.',
      message: value => value.trim().length >= 10 || 'Message should be at least 10 characters.'
    };

    let ok = true;
    for (const key in rules) {
      const result = rules[key](form[key].value);
      $('#err-' + key).textContent = result === true ? '' : result;
      if (result !== true) ok = false;
    }

    if (!ok) return;

    const msg = $('#form-msg');
    msg.className = 'form-msg ok';
    msg.textContent = 'Thanks ' + form.name.value.trim().split(' ')[0] + '! Your message has been received – we reply within 1 business day.';
    form.reset();
  });
}

const FREE_SHIP_OVER = 200;
const SHIP_FEE = 12;
const PROMO_CODE = 'ASPEC10';
let orderPlaced = false;

const getPromo = () => {
  try { return localStorage.getItem('aspec_promo') || ''; } catch (e) { return ''; }
};

const setPromo = value => {
  try {
    if (value) localStorage.setItem('aspec_promo', value);
    else localStorage.removeItem('aspec_promo');
  } catch (e) {}
};

function totals() {
  const subtotal = cart.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);
  const discount = getPromo() === PROMO_CODE ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIP_OVER ? 0 : SHIP_FEE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

function summaryHTML(mode) {
  const t = totals();
  const left = FREE_SHIP_OVER - (t.subtotal - t.discount);
  const rows =
    `<div class="sum-row"><span>Subtotal</span><span>${RM(t.subtotal)}</span></div>` +
    (t.discount ? `<div class="sum-row disc"><span>Promo ${PROMO_CODE} (−10%)</span><span>−${RM(t.discount)}</span></div>` : '') +
    `<div class="sum-row"><span>Shipping</span><span>${t.shipping ? RM(t.shipping) : 'Free'}</span></div>` +
    `<div class="sum-row total"><span>Total</span><span>${RM(t.total)}</span></div>`;
  const ship = t.subtotal && left > 0 ? `<p class="ship-note">Add ${RM(left)} more for free shipping.</p>` : '';

  if (mode === 'checkout') {
    const items = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      return `<div class="sum-item"><span>${product.name} × ${item.qty}</span><span>${RM(product.price * item.qty)}</span></div>`;
    }).join('');

    return `<h3>Order summary</h3><div class="sum-items">${items}</div>${rows}${ship}
      <button class="btn btn-primary" type="submit">Place order</button>
      <a class="back-link" href="cart.html">← Edit cart</a>
      <p class="secure-note">🔒 Demo checkout – no payment is taken.</p>`;
  }

  return `<h3>Order summary</h3>${rows}${ship}
    <div class="promo"><input id="promo-input" placeholder="Promo code" value="${getPromo()}" aria-label="Promo code"><button class="btn btn-ghost btn-sm" type="button" id="apply-promo" style="width:auto;margin:0">Apply</button></div>
    <a class="btn btn-primary${cart.length ? '' : ' disabled'}" href="checkout.html">Proceed to checkout</a>
    <a class="back-link" href="products.html">← Continue shopping</a>`;
}

function renderPages() {
  const lines = $('#cart-lines');
  const sum = $('#summary');

  if (lines) {
    lines.innerHTML = cart.length
      ? cart.map(item => {
          const product = PRODUCTS.find(p => p.id === item.id);
          return `<div class="cart-line">
            <div class="ci-ico">${ICONS[product.cat]}</div>
            <div>
              <h4>${product.name}</h4>
              <small>${CATS[product.cat]} · ${RM(product.price)} each</small>
              <div class="qty">
                <button aria-label="Decrease" onclick="changeQty(${product.id},-1)">−</button>
                <span>${item.qty}</span>
                <button aria-label="Increase" onclick="changeQty(${product.id},1)">+</button>
              </div>
            </div>
            <div class="line-end"><strong>${RM(product.price * item.qty)}</strong><button class="ci-remove" onclick="removeItem(${product.id})">Remove</button></div>
          </div>`;
        }).join('')
      : '<div class="cart-empty-page"><h3>Your cart is empty</h3><p>Looks like you haven\'t added anything yet.</p><a class="btn btn-primary" href="products.html">Browse products</a></div>';
  }

  if (sum) {
    sum.innerHTML = summaryHTML(sum.dataset.mode);
    if (sum.dataset.mode === 'checkout' && !cart.length && !orderPlaced) location.href = 'cart.html';
  }
}

function initCheckout() {
  document.addEventListener('click', event => {
    if (event.target.id !== 'apply-promo') return;

    const value = $('#promo-input').value.trim().toUpperCase();
    if (!value) {
      setPromo('');
      renderPages();
      toast('Promo removed');
    } else if (value === PROMO_CODE) {
      setPromo(value);
      renderPages();
      toast('Promo applied: 10% off');
    } else {
      toast('Invalid promo code');
    }
  });

  const form = $('#checkout-form');
  if (!form) return;

  const el = name => form.elements[name];
  const val = name => el(name).value.trim();
  const digits = text => text.replace(/\D/g, '');
  const cardFields = $('#card-fields');

  $$('input[name="pay"]', form).forEach(radio => {
    radio.addEventListener('change', () => {
      cardFields.style.display = el('pay').value === 'card' ? 'block' : 'none';
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const rules = {
      fullname: () => val('fullname').length >= 2 || 'Please enter your full name.',
      email: () => validEmail(val('email')) || 'Please enter a valid email.',
      phone: () => /^\+?[0-9\s-]{9,15}$/.test(val('phone')) || 'Please enter a valid phone number.',
      address: () => val('address').length >= 5 || 'Please enter your street address.',
      city: () => val('city').length >= 2 || 'Please enter your city.',
      postcode: () => /^\d{5}$/.test(val('postcode')) || 'Postcode should be 5 digits.',
      state: () => !!val('state') || 'Please select a state.'
    };

    if (el('pay').value === 'card') {
      rules.cardnum = () => (digits(val('cardnum')).length >= 13 && digits(val('cardnum')).length <= 19) || 'Enter a valid card number.';
      rules.expiry = () => /^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(val('expiry')) || 'Use the format MM/YY.';
      rules.cvc = () => /^\d{3,4}$/.test(val('cvc')) || 'Enter the 3–4 digit code.';
    }

    let firstBad = null;
    ['fullname', 'email', 'phone', 'address', 'city', 'postcode', 'state', 'cardnum', 'expiry', 'cvc'].forEach(key => {
      const result = rules[key] ? rules[key]() : true;
      $('#err-' + key).textContent = result === true ? '' : result;
      if (result !== true && !firstBad) firstBad = el(key);
    });

    if (firstBad) {
      firstBad.focus();
      return;
    }

    const total = totals();
    const orderNo = 'ASP-' + Math.floor(100000 + Math.random() * 900000);
    const payLabel = { card: 'Credit / debit card', fpx: 'FPX online banking', cod: 'Cash on delivery' }[el('pay').value];
    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

    $('#order-done').innerHTML = `
      <div class="check-ico">✓</div>
      <h2>Thank you, ${val('fullname').split(' ')[0]}!</h2>
      <p>Your order has been placed. A confirmation will be sent to <strong>${val('email')}</strong>.</p>
      <div class="order-no">${orderNo}</div>
      <div class="done-details">
        <div><span>Items</span><span>${itemCount}</span></div>
        <div><span>Payment</span><span>${payLabel}</span></div>
        <div><span>Deliver to</span><span>${val('city')}, ${val('state')} ${val('postcode')}</span></div>
        <div><strong>Total</strong><strong>${RM(total.total)}</strong></div>
      </div>
      <div class="hero-actions" style="justify-content:center">
        <a href="products.html" class="btn btn-primary">Continue shopping</a>
        <a href="index.html" class="btn btn-ghost">Back to home</a>
      </div>
      <p class="demo-note" style="margin-top:20px">This is a demo store – no real order or payment was made.</p>`;

    orderPlaced = true;
    form.style.display = 'none';
    $('#order-done').style.display = 'block';
    cart = [];
    saveCart();
    setPromo('');
    renderCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-label="Shopping cart">
      <div class="drawer-head"><h3>Your cart</h3><button aria-label="Close cart" id="close-cart">×</button></div>
      <div class="drawer-items" id="drawer-items"></div>
      <div class="drawer-foot">
        <div class="total-row"><span>Total</span><span id="cart-total">RM 0</span></div>
        <a class="btn btn-ghost" href="cart.html" style="margin-bottom:10px">View cart</a>
        <button class="btn btn-primary" id="checkout">Checkout</button>
      </div>
    </aside>
    <div class="toast" id="toast"></div>`);

  $('#overlay').onclick = $('#close-cart').onclick = () => openCart(false);
  $('#checkout').onclick = checkout;
  $$('.cart-btn').forEach(button => button.onclick = () => openCart(true));

  const mobileMenuButton = $('.menu-btn');
  if (mobileMenuButton) mobileMenuButton.onclick = () => $('.nav-links').classList.toggle('open');

  $$('.year').forEach(node => node.textContent = new Date().getFullYear());

  renderCart();
  initHome();
  initContact();
  initCheckout();
});
