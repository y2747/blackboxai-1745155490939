document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const cartButton = document.getElementById('cart-button');
  const cartCount = document.getElementById('cart-count');
  const cartDropdown = document.getElementById('cart-dropdown');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const payNowButton = document.getElementById('pay-now-button');

  // Product data map by ID
  const products = {
    "1": { name: "PureHydra Moisturizer", price: 29.99 },
    "2": { name: "GreenCleanser Facial Cleanser", price: 19.99 },
    "3": { name: "VitaC Serum", price: 34.99 },
    "4": { name: "EcoToner Balancing Toner", price: 24.99 },
    "5": { name: "BambooExfoliant Gentle Scrub", price: 22.99 },
    "6": { name: "NightRepair Cream", price: 39.99 }
  };

  // Mobile menu toggle
  mobileMenuButton.addEventListener('click', () => {
    if (mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.remove('hidden');
    } else {
      mobileMenu.classList.add('hidden');
    }
  });

  // Cart state management: array of {id, quantity}
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Calculate total price
  function calculateTotal() {
    return cart.reduce((total, item) => {
      const product = products[item.id];
      return total + (product.price * item.quantity);
    }, 0);
  }

  // Update cart count badge
  function updateCartCount() {
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQuantity;
    cartCount.style.display = totalQuantity > 0 ? 'flex' : 'none';
  }

  // Render cart items in dropdown
  function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<li class="text-gray-500">Your basket is empty.</li>';
      cartTotal.textContent = '$0.00';
      payNowButton.disabled = true;
      payNowButton.classList.add('opacity-50', 'cursor-not-allowed');
      return;
    }
    payNowButton.disabled = false;
    payNowButton.classList.remove('opacity-50', 'cursor-not-allowed');

    cart.forEach(item => {
      const product = products[item.id];
      const li = document.createElement('li');
      li.className = 'flex justify-between items-center';

      li.innerHTML = `
        <div>
          <p class="font-semibold text-green-800">${product.name}</p>
          <p class="text-sm text-green-700">$${product.price.toFixed(2)}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button class="decrease-qty bg-gray-200 px-2 rounded" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button class="increase-qty bg-gray-200 px-2 rounded" data-id="${item.id}">+</button>
          <button class="remove-item text-red-600 ml-2" title="Remove" data-id="${item.id}">&times;</button>
        </div>
      `;
      cartItemsContainer.appendChild(li);
    });

    cartTotal.textContent = '$' + calculateTotal().toFixed(2);

    // Attach event listeners for quantity buttons and remove buttons
    cartItemsContainer.querySelectorAll('.increase-qty').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item) {
          item.quantity++;
          saveCart();
          updateCartCount();
          renderCart();
        }
      });
    });

    cartItemsContainer.querySelectorAll('.decrease-qty').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const item = cart.find(i => i.id === id);
        if (item && item.quantity > 1) {
          item.quantity--;
          saveCart();
          updateCartCount();
          renderCart();
        }
      });
    });

    cartItemsContainer.querySelectorAll('.remove-item').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        cart = cart.filter(i => i.id !== id);
        saveCart();
        updateCartCount();
        renderCart();
      });
    });
  }

  updateCartCount();
  renderCart();

  // Add to Cart button handler
  const addToCartButtons = document.querySelectorAll('button[data-product-id]');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-product-id');
      const existingItem = cart.find(i => i.id === productId);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ id: productId, quantity: 1 });
      }
      saveCart();
      updateCartCount();
      renderCart();
    });
  });

  // Toggle cart dropdown visibility
  cartButton.addEventListener('click', () => {
    if (cartDropdown.classList.contains('hidden')) {
      cartDropdown.classList.remove('hidden');
    } else {
      cartDropdown.classList.add('hidden');
    }
  });

  // Create checkout modal
  const modalHtml = `
    <div id="checkout-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 class="text-xl font-bold mb-4">Checkout</h2>
        <form id="payment-form" class="space-y-4">
          <div>
            <label for="card-number" class="block text-sm font-medium text-gray-700">Card Number</label>
            <input type="text" id="card-number" name="card-number" maxlength="19" placeholder="1234 5678 9012 3456" required class="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label for="expiry" class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input type="text" id="expiry" name="expiry" maxlength="5" placeholder="MM/YY" required class="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label for="cvc" class="block text-sm font-medium text-gray-700">CVC</label>
            <input type="text" id="cvc" name="cvc" maxlength="4" placeholder="123" required class="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <button type="submit" class="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition">Pay Now</button>
          <button type="button" id="close-modal" class="mt-2 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition">Cancel</button>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const checkoutModal = document.getElementById('checkout-modal');
  const paymentForm = document.getElementById('payment-form');
  const closeModalButton = document.getElementById('close-modal');

  // Show checkout modal on Pay Now button click
  payNowButton.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    cartDropdown.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
  });

  // Close modal handler
  closeModalButton.addEventListener('click', () => {
    checkoutModal.classList.add('hidden');
  });

  // Payment form submission handler (simulate payment)
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Payment successful! Thank you for your purchase.');
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    checkoutModal.classList.add('hidden');
  });
});
