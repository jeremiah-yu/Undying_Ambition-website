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
        textEl.appendChild(document.createTextNode('You want to order: '));
        textEl.appendChild(strong);
        textEl.appendChild(document.createTextNode('. Message us on Facebook for payment and delivery. '));
        var tl = document.createElement('span');
        tl.className = 'text-white/60';
        tl.textContent = 'Gusto mo order: ' + productName + '. Mag-message sa Facebook para sa payment at delivery.';
        textEl.appendChild(document.createElement('br'));
        textEl.appendChild(tl);
      } else if (textEl) {
        textEl.innerHTML = 'To place your order, message us on our Facebook page. Send your order there and we\u2019ll follow up on payment and delivery.<br /><span class="text-white/60">Para makapag-order, mag-message sa Facebook. I-send ang order doon at makikipag-ugnayan kami para sa payment at delivery.</span>';
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

  // Gallery lightbox
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxClose = document.getElementById('lightbox-close');

  function openLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.src = '';
  }

  document.addEventListener('click', function (e) {
    var item = e.target.closest('.gallery-item');
    if (item) {
      openLightbox(item.getAttribute('data-src'), item.getAttribute('data-caption'));
      return;
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
