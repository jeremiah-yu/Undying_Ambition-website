/**
 * Undying Ambition — site scripts (vanilla JS)
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Configuration — replace YOUR_FACEBOOK_PAGE_USERNAME with your Page @username
  // if m.me links fail. Numeric Page ID works for many business pages.
  // ---------------------------------------------------------------------------
  var CONFIG = {
    facebookPageUrl: 'https://www.facebook.com/profile.php?id=61584714136561',
    facebookMessengerUsername: '61584714136561',
    instagramUrl: 'https://www.instagram.com/u.ambition_',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
  };

  var currentProduct = '';

  // ---------------------------------------------------------------------------
  // Hero background video
  // ---------------------------------------------------------------------------
  function initHeroVideo() {
    var video = document.getElementById('hero-video');
    if (!video) return;

    video.addEventListener('error', function () {
      video.classList.add('is-hidden');
    });

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        /* Autoplay blocked — video stays visible; user may tap play in some browsers */
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Social links
  // ---------------------------------------------------------------------------
  function applySocialLinks() {
    document.querySelectorAll('[data-social="facebook"]').forEach(function (el) {
      el.href = CONFIG.facebookPageUrl;
    });
    document.querySelectorAll('[data-social="instagram"]').forEach(function (el) {
      el.href = CONFIG.instagramUrl;
    });
  }

  // ---------------------------------------------------------------------------
  // Mobile navigation
  // ---------------------------------------------------------------------------
  function initMobileMenu() {
    var menuBtn = document.getElementById('menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Order modal — size, name, address → Facebook Messenger
  // ---------------------------------------------------------------------------
  function getModalElements() {
    return {
      modal: document.getElementById('order-modal'),
      backdrop: document.getElementById('modal-backdrop'),
      productLabel: document.getElementById('order-product-label'),
      sizeSelect: document.getElementById('order-size'),
      quantityInput: document.getElementById('order-quantity'),
      nameInput: document.getElementById('order-name'),
      addressInput: document.getElementById('order-address'),
      errorBox: document.getElementById('order-error'),
      form: document.getElementById('order-form'),
    };
  }

  function populateSizeOptions(selectEl) {
    if (!selectEl) return;
    selectEl.innerHTML = '<option value="">Select size</option>';
    CONFIG.sizes.forEach(function (size) {
      var opt = document.createElement('option');
      opt.value = size;
      opt.textContent = size;
      selectEl.appendChild(opt);
    });
  }

  function showNotice(message, type) {
    var els = getModalElements();
    if (!els.errorBox) return;
    els.errorBox.textContent = message;
    els.errorBox.classList.add('is-visible');
    els.errorBox.classList.toggle('is-success', type === 'success');
  }

  function showError(message) {
    showNotice(message, 'error');
  }

  function showSuccess(message) {
    showNotice(message, 'success');
  }

  function hideError() {
    var els = getModalElements();
    if (!els.errorBox) return;
    els.errorBox.textContent = '';
    els.errorBox.classList.remove('is-visible', 'is-success');
  }

  function isAndroid() {
    return /Android/i.test(navigator.userAgent);
  }

  /** Strip symbols/emojis that break Messenger prefill on iOS. */
  function clean(value) {
    return String(value).replace(/[^\w\s.,-]/g, '').replace(/\s+/g, ' ').trim();
  }

  function buildMessengerMessage(data) {
    return [
      'New Order',
      'Product: ' + clean(currentProduct),
      'Size: ' + clean(data.size),
      'Qty: ' + clean(data.quantity),
      'Name: ' + clean(data.name),
      'Address: ' + clean(data.address),
    ].join('\n');
  }

  /**
   * m.me URL with pre-filled message (Meta business Page).
   */
  function getMessengerUrlWithText(message) {
    var pageId = CONFIG.facebookMessengerUsername;
    return 'https://m.me/' + pageId + '?text=' + encodeURIComponent(message);
  }

  /**
   * Android: open Messenger app directly with pre-filled text.
   */
  function getAndroidMessengerIntentUrl(message) {
    var pageId = CONFIG.facebookMessengerUsername;
    var encoded = encodeURIComponent(message);
    return (
      'intent://m.me/' + pageId + '?text=' + encoded +
      '#Intent;scheme=https;package=com.facebook.orca;action=android.intent.action.VIEW;end'
    );
  }

  /** Redirect to Messenger with sanitized, encoded order text. */
  function openMessengerWithPrefill(message) {
    var httpsUrl = getMessengerUrlWithText(message);
    var url = isAndroid() ? getAndroidMessengerIntentUrl(message) : httpsUrl;

    closeOrderModal();
    window.open(url, '_blank');
  }

  function openOrderModal(productName) {
    var els = getModalElements();
    if (!els.modal) return;

    currentProduct = productName || 'Undying Ambition Tee';
    if (els.productLabel) {
      els.productLabel.textContent = currentProduct;
    }
    if (els.form) els.form.reset();
    hideError();
    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (els.nameInput) {
      setTimeout(function () {
        els.nameInput.focus();
      }, 100);
    }
  }

  function closeOrderModal() {
    var els = getModalElements();
    if (!els.modal) return;
    els.modal.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    hideError();
  }

  function validateOrderForm() {
    var els = getModalElements();
    var size = els.sizeSelect ? els.sizeSelect.value.trim() : '';
    var quantity = els.quantityInput ? parseInt(els.quantityInput.value, 10) : 0;
    var name = els.nameInput ? els.nameInput.value.trim() : '';
    var address = els.addressInput ? els.addressInput.value.trim() : '';

    if (!size) {
      showError('Please select a size.');
      if (els.sizeSelect) els.sizeSelect.focus();
      return null;
    }
    if (!quantity || quantity < 1) {
      showError('Please enter a valid quantity (minimum 1).');
      if (els.quantityInput) els.quantityInput.focus();
      return null;
    }
    if (!name) {
      showError('Please enter your full name.');
      if (els.nameInput) els.nameInput.focus();
      return null;
    }
    if (!address) {
      showError('Please enter your delivery address.');
      if (els.addressInput) els.addressInput.focus();
      return null;
    }

    return { size: size, quantity: String(quantity), name: name, address: address };
  }

  function handlePlaceOrder(event) {
    event.preventDefault();
    hideError();

    var data = validateOrderForm();
    if (!data) return;

    openMessengerWithPrefill(buildMessengerMessage(data));
  }

  function initOrderFlow() {
    var els = getModalElements();
    populateSizeOptions(els.sizeSelect);

    document.addEventListener('click', function (e) {
      var orderBtn = e.target.closest('[data-order-product]');
      if (orderBtn) {
        openOrderModal(orderBtn.getAttribute('data-order-product'));
      }
    });

    if (els.form) {
      els.form.addEventListener('submit', handlePlaceOrder);
    }

    var closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeOrderModal);
    if (els.backdrop) els.backdrop.addEventListener('click', closeOrderModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && els.modal && els.modal.classList.contains('is-open')) {
        closeOrderModal();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Gallery lightbox (gallery.html)
  // ---------------------------------------------------------------------------
  function initGalleryLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxClose = document.getElementById('lightbox-close');
    if (!lightbox || !lightboxImg) return;

    function openLightbox(src, caption) {
      lightboxImg.src = src;
      lightboxImg.alt = caption || '';
      if (lightboxCaption) lightboxCaption.textContent = caption || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    document.addEventListener('click', function (e) {
      var item = e.target.closest('.gallery-item');
      if (item) {
        openLightbox(item.getAttribute('data-src'), item.getAttribute('data-caption'));
      }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 8) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function init() {
    initHeroVideo();
    applySocialLinks();
    initMobileMenu();
    initStickyHeader();
    initOrderFlow();
    initGalleryLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
