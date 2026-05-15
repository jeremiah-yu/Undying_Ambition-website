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

  function isIOS() {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  /**
   * Plain-text order message (readable preview + clipboard).
   */
  function buildOrderMessage(data) {
    return [
      'Hello, I would like to place an order.',
      '',
      'Product: ' + currentProduct,
      'Size: ' + data.size,
      'Quantity: ' + data.quantity,
      'Name: ' + data.name,
      'Address: ' + data.address,
    ].join('\n');
  }

  /**
   * Single-line text for m.me ?text= (newlines break on some iOS builds).
   */
  function buildMessengerLinkText(data) {
    var address = data.address.replace(/\s+/g, ' ').trim();
    return [
      'Order: ' + currentProduct,
      'Size: ' + data.size,
      'Qty: ' + data.quantity,
      'Name: ' + data.name,
      'Address: ' + address,
    ].join(' | ');
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      try {
        var ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (ok) resolve();
        else reject(new Error('copy failed'));
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function getMessengerChatUrl() {
    return 'https://m.me/' + CONFIG.facebookMessengerUsername;
  }

  function resetOrderModalView() {
    var formWrap = document.getElementById('order-form-wrap');
    var sendStep = document.getElementById('order-send-step');
    if (formWrap) formWrap.hidden = false;
    if (sendStep) sendStep.hidden = true;
    hideSendStepNotice();
  }

  function showSendStepNotice(message, isSuccess) {
    var notice = document.getElementById('order-send-notice');
    if (!notice) return;
    notice.textContent = message;
    notice.classList.add('is-visible');
    notice.classList.toggle('is-success', !!isSuccess);
  }

  function hideSendStepNotice() {
    var notice = document.getElementById('order-send-notice');
    if (!notice) return;
    notice.textContent = '';
    notice.classList.remove('is-visible', 'is-success');
  }

  function showIOSSendStep(message) {
    var formWrap = document.getElementById('order-form-wrap');
    var sendStep = document.getElementById('order-send-step');
    var preview = document.getElementById('order-message-preview');
    var openBtn = document.getElementById('messenger-open-btn');
    if (!formWrap || !sendStep || !preview || !openBtn) {
      window.location.assign(getMessengerChatUrl());
      return;
    }

    preview.value = message;
    openBtn.href = getMessengerChatUrl();
    formWrap.hidden = true;
    sendStep.hidden = false;
    hideError();
    hideSendStepNotice();

    copyToClipboard(message).then(function () {
      showSendStepNotice('Order copied — paste in Messenger before sending.', true);
    }).catch(function () {
      showSendStepNotice('Tap the message below, select all, then Copy before opening Messenger.', false);
    });

    preview.focus();
    preview.select();
  }

  /**
   * Business Page m.me link with pre-filled message (supported by Meta for Pages).
   */
  function getMessengerUrlWithText(message) {
    var pageId = CONFIG.facebookMessengerUsername;
    return 'https://m.me/' + pageId + '?text=' + encodeURIComponent(message);
  }

  /**
   * Opens Messenger with pre-filled text. Form GET submit keeps the iOS user-gesture
   * chain so ?text= is applied when the Messenger app opens.
   */
  function openMessengerWithPrefill(message) {
    var sendForm = document.getElementById('messenger-send-form');
    var textInput = document.getElementById('messenger-prefill-text');
    var pageId = CONFIG.facebookMessengerUsername;
    var baseAction = 'https://m.me/' + pageId;

    if (sendForm && textInput) {
      sendForm.action = baseAction;
      textInput.value = message;
      sendForm.submit();
      return;
    }

    window.location.assign(getMessengerUrlWithText(message));
  }

  function openOrderModal(productName) {
    var els = getModalElements();
    if (!els.modal) return;

    currentProduct = productName || 'Undying Ambition Tee';
    if (els.productLabel) {
      els.productLabel.textContent = currentProduct;
    }
    if (els.form) els.form.reset();
    resetOrderModalView();
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
    resetOrderModalView();
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

    var message = buildOrderMessage(data);

    // iOS Messenger drops ?text= on send — copy + paste is the reliable path
    if (isIOS()) {
      showIOSSendStep(message);
      return;
    }

    openMessengerWithPrefill(buildMessengerLinkText(data));
  }

  function initMessengerForm() {
    var sendForm = document.getElementById('messenger-send-form');
    if (!sendForm) return;
    sendForm.action = 'https://m.me/' + CONFIG.facebookMessengerUsername;
  }

  function initOrderFlow() {
    var els = getModalElements();
    initMessengerForm();
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

    var sendBackBtn = document.getElementById('order-send-back-btn');
    if (sendBackBtn) {
      sendBackBtn.addEventListener('click', function () {
        resetOrderModalView();
        hideError();
      });
    }

    var copyAgainBtn = document.getElementById('order-copy-again-btn');
    if (copyAgainBtn) {
      copyAgainBtn.addEventListener('click', function () {
        var preview = document.getElementById('order-message-preview');
        if (!preview) return;
        copyToClipboard(preview.value).then(function () {
          showSendStepNotice('Copied again.', true);
        }).catch(function () {
          preview.focus();
          preview.select();
          showSendStepNotice('Select the text above, then tap Copy.', false);
        });
      });
    }

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
