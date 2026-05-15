(function () {
  'use strict';

  var config = window.SITE_CONFIG || {};
  var fb = config.facebook || 'https://www.facebook.com/';
  var ig = config.instagram || 'https://www.instagram.com/';

  // Apply social links from config (FB, IG, at order-via-FB buttons)
  function applySocialLinks() {
    [].forEach.call(document.querySelectorAll('[id="btn-fb"], [id="footer-fb"], [id="order-via-fb"], [id="order-modal-fb-btn"]'), function (el) {
      el.href = fb;
    });
    [].forEach.call(document.querySelectorAll('[id="btn-ig"], [id="footer-ig"]'), function (el) {
      el.href = ig;
    });
  }

  function openModal(productName) {
    var modal = document.getElementById('order-modal');
    var textEl = document.getElementById('order-modal-product');
    if (modal) {
      if (textEl && productName) {
        var strong = document.createElement('strong');
        strong.className = 'text-brand-red';
        strong.textContent = productName;
        textEl.textContent = '';
        textEl.appendChild(document.createTextNode('Gusto mo order: '));
        textEl.appendChild(strong);
        textEl.appendChild(document.createTextNode('. Para makapag-order, mag-message sa aming Facebook page. I-send ang order doon at makikipag-ugnayan kami para sa payment at delivery.'));
      } else if (textEl) {
        textEl.textContent = 'Para makapag-order, mag-message sa aming Facebook page. I-send ang product na gusto mo at makikipag-ugnayan kami para sa payment at delivery.';
      }
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    var modal = document.getElementById('order-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  // Order button sa product: ipakita modal, tapos sila mag-bukas ng FB
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.add-to-order');
    if (btn) {
      var name = btn.getAttribute('data-name');
      openModal(name || '');
      return;
    }
  });

  // Close modal
  var closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  var backdrop = document.getElementById('modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  // Mobile menu
  var menuBtn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
  }
  document.querySelectorAll('#mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      mobileMenu.classList.add('hidden');
    });
  });

  applySocialLinks();
})();
