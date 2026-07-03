(function () {
  'use strict';

  /* ──────────────────────────────────────────────────
     SDL Gallery Lightbox v1.0
     square-design-lab/Gallery-Lightbox
     ────────────────────────────────────────────────── */

  var PLUGIN = 'gallery-lightbox';
  var PS_CDN = 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/';
  var ID_RE = /^gallery-lightbox(-\d+)?$/;

  var ITEM_SEL = [
    '.gallery-grid-item',
    '.gallery-masonry-item',
    '.gallery-strips-item',
    '.gallery-slideshow-item-wrapper',
    '.gallery-fullscreen-slideshow-item-wrapper',
    '.gallery-reel-item',
    '.gallery-stacked-item',
    '.sqs-gallery-design-grid-slide',
    '.sqs-gallery-design-stacked-slide'
  ].join(',');

  /* ── defaults ─────────────────────────────────── */
  var DEFAULTS = {
    thumbnails: true,
    thumbnailHeight: 60,
    thumbnailBorderRadius: 4,
    thumbnailGap: 6,
    thumbnailActiveBorderColor: '#ffffff',
    thumbnailActiveBorderWidth: 2,

    showZoom: true,
    showDownload: true,
    showCounter: true,
    showFullscreen: false,
    showShare: true,

    showArrows: true,
    arrowColor: '#ffffff',
    arrowBg: 'rgba(255,255,255,0.12)',
    arrowBorder: 'none',
    arrowBorderRadius: '50%',
    arrowSize: 48,
    customPrevArrow: '',
    customNextArrow: '',

    closeColor: '#ffffff',
    closeBg: 'transparent',
    closeBorder: 'none',
    closeBorderRadius: '50%',
    closeSize: 44,
    customCloseIcon: '',

    bgColor: 'rgba(0,0,0,0.92)',

    transition: 'fade',

    showLightboxIcon: true,
    lightboxIconPosition: 'top-right',
    lightboxIconColor: '#ffffff',
    lightboxIconBg: 'rgba(0,0,0,0.4)',
    lightboxIconBorderRadius: '6px',

    showCaption: false,
    captionPosition: 'overlaid-bottom',
    captionColor: '#ffffff',
    captionFontSize: 14,

    showOverlay: false,
    overlayColor: 'rgba(0,0,0,0.3)',

    maxZoomLevel: 3,

    counterColor: '#ffffff',
    counterFontSize: 14,

    toolbarIconColor: '#ffffff',
    toolbarIconSize: 22
  };

  var CFG = merge(DEFAULTS, window.SDL_LIGHTBOX_CONFIG || {});

  /* ── state ────────────────────────────────────── */
  var _PSLightbox = null;
  var _PhotoSwipe = null;
  var _psLoaded = false;
  var _activePswp = null;
  var _instances = [];

  /* ── icons ────────────────────────────────────── */
  var ICONS = {
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    zoomOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    fullscreen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    thumbnails: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    prevArrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    nextArrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
  };

  /* ── utilities ────────────────────────────────── */
  function merge(a, b) {
    var out = {};
    for (var k in a) out[k] = a[k];
    for (var k in b) if (b[k] !== undefined) out[k] = b[k];
    return out;
  }

  function getConfigFor(sectionId) {
    var perSection = CFG.sections && CFG.sections[sectionId];
    return perSection ? merge(CFG, perSection) : CFG;
  }

  function getImgSrc(img) {
    return img.dataset.src || img.dataset.image || img.getAttribute('data-image') || img.currentSrc || img.src || '';
  }

  function fullUrl(src) {
    if (!src) return '';
    try {
      var u = new URL(src, location.origin);
      u.searchParams.delete('format');
      u.searchParams.delete('content-type');
      return u.toString();
    } catch (e) { return src.split('?')[0]; }
  }

  function thumbUrl(src, w) {
    if (!src) return '';
    try {
      var u = new URL(src, location.origin);
      u.searchParams.set('format', (w || 300) + 'w');
      return u.toString();
    } catch (e) { return src; }
  }

  function getDims(img, item) {
    var d = img.dataset.imageDimensions || img.getAttribute('data-image-dimensions');
    if (!d && item) d = item.dataset.imageDimensions || item.getAttribute('data-image-dimensions');
    if (!d) {
      var fig = img.closest('figure');
      if (fig) d = fig.dataset.imageDimensions || fig.getAttribute('data-image-dimensions');
    }
    if (d) {
      var p = d.split('x');
      if (p.length === 2) return { w: parseInt(p[0]) || 1200, h: parseInt(p[1]) || 800 };
    }
    if (img.naturalWidth && img.naturalHeight) return { w: img.naturalWidth, h: img.naturalHeight };
    return { w: 1200, h: 800 };
  }

  function getCaption(item, img) {
    var el = item.querySelector('.gallery-caption, .gallery-caption-content, figcaption');
    if (el) return el.textContent.trim();
    return img.alt || '';
  }

  function getClickthrough(item) {
    var links = item.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var h = links[i].getAttribute('href');
      if (h && h.indexOf('itemId') === -1 && h !== '#') return h;
    }
    return '';
  }

  /* ── PhotoSwipe loader ────────────────────────── */
  function loadPSCSS() {
    if (document.querySelector('link[href*="photoswipe"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = PS_CDN + 'photoswipe.css';
    document.head.appendChild(link);
  }

  function loadPS() {
    if (_psLoaded) return Promise.resolve();
    return Promise.all([
      import(PS_CDN + 'photoswipe-lightbox.esm.min.js'),
      import(PS_CDN + 'photoswipe.esm.min.js')
    ]).then(function (m) {
      _PSLightbox = m[0].default;
      _PhotoSwipe = m[1].default;
      _psLoaded = true;
    });
  }

  /* ── image extraction ─────────────────────────── */
  function extractImages(section) {
    var items = section.querySelectorAll(ITEM_SEL);
    if (!items.length) {
      items = section.querySelectorAll('.gallery-section img, .sqs-gallery img');
      var wrapper = [];
      items.forEach(function (img) { wrapper.push(img.closest('figure, div, a') || img.parentElement); });
      items = wrapper;
    }
    if (!items.length) {
      var allImgs = section.querySelectorAll('img[data-src], img[data-image]');
      if (allImgs.length) {
        var w2 = [];
        allImgs.forEach(function (img) { w2.push(img.closest('figure, div, a') || img.parentElement); });
        items = w2;
      }
    }

    var images = [];
    var seen = new Set();

    var nodeList = items instanceof NodeList ? items : items;
    for (var i = 0; i < nodeList.length; i++) {
      var item = nodeList[i];
      if (!item) continue;
      var img = item.tagName === 'IMG' ? item : item.querySelector('img[data-src], img[data-image], img.thumb-image, img');
      if (!img) continue;

      var src = getImgSrc(img);
      if (!src || seen.has(src)) continue;
      seen.add(src);

      var dims = getDims(img, item);
      images.push({
        src: src,
        fullSrc: fullUrl(src),
        thumbSrc: thumbUrl(src, 300),
        width: dims.w,
        height: dims.h,
        alt: img.alt || '',
        caption: getCaption(item, img),
        clickthroughUrl: getClickthrough(item),
        element: item,
        imgEl: img
      });
    }
    return images;
  }

  /* ── lightbox icon overlay ────────────────────── */
  function addIcons(section, images, cfg) {
    if (!cfg.showLightboxIcon) return;
    images.forEach(function (img) {
      var el = img.element;
      if (el.querySelector('.sdl-lb-icon')) return;

      var pos = el.style.position;
      if (!pos || pos === 'static') el.style.position = 'relative';

      var icon = document.createElement('span');
      icon.className = 'sdl-lb-icon sdl-lb-icon--' + cfg.lightboxIconPosition;
      icon.innerHTML = ICONS.expand;
      icon.style.setProperty('--sdl-lb-icon-color', cfg.lightboxIconColor);
      icon.style.setProperty('--sdl-lb-icon-bg', cfg.lightboxIconBg);
      icon.style.setProperty('--sdl-lb-icon-radius', cfg.lightboxIconBorderRadius);
      el.appendChild(icon);
    });
  }

  function removeIcons(section) {
    section.querySelectorAll('.sdl-lb-icon').forEach(function (el) { el.remove(); });
  }

  /* ── apply CSS custom props to pswp ───────────── */
  function applyStyles(el, cfg) {
    var s = el.style;
    s.setProperty('--sdl-lb-bg', cfg.bgColor);
    s.setProperty('--sdl-lb-arrow-color', cfg.arrowColor);
    s.setProperty('--sdl-lb-arrow-bg', cfg.arrowBg);
    s.setProperty('--sdl-lb-arrow-border', cfg.arrowBorder);
    s.setProperty('--sdl-lb-arrow-radius', cfg.arrowBorderRadius);
    s.setProperty('--sdl-lb-arrow-size', cfg.arrowSize + 'px');
    s.setProperty('--sdl-lb-close-color', cfg.closeColor);
    s.setProperty('--sdl-lb-close-bg', cfg.closeBg);
    s.setProperty('--sdl-lb-close-border', cfg.closeBorder);
    s.setProperty('--sdl-lb-close-radius', cfg.closeBorderRadius);
    s.setProperty('--sdl-lb-close-size', cfg.closeSize + 'px');
    s.setProperty('--sdl-lb-thumb-height', cfg.thumbnailHeight + 'px');
    s.setProperty('--sdl-lb-thumb-radius', cfg.thumbnailBorderRadius + 'px');
    s.setProperty('--sdl-lb-thumb-gap', cfg.thumbnailGap + 'px');
    s.setProperty('--sdl-lb-thumb-active-color', cfg.thumbnailActiveBorderColor);
    s.setProperty('--sdl-lb-thumb-active-width', cfg.thumbnailActiveBorderWidth + 'px');
    s.setProperty('--sdl-lb-counter-color', cfg.counterColor);
    s.setProperty('--sdl-lb-counter-size', cfg.counterFontSize + 'px');
    s.setProperty('--sdl-lb-toolbar-color', cfg.toolbarIconColor);
    s.setProperty('--sdl-lb-toolbar-size', cfg.toolbarIconSize + 'px');
    s.setProperty('--sdl-lb-caption-color', cfg.captionColor);
    s.setProperty('--sdl-lb-caption-size', cfg.captionFontSize + 'px');
  }

  /* ── download handler ─────────────────────────── */
  function downloadImage(imageData) {
    var url = imageData.fullSrc || imageData.src;
    var link = document.createElement('a');
    link.href = url;
    var parts = url.split('/');
    var name = parts[parts.length - 1].split('?')[0] || 'image';
    link.download = name;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ── open lightbox ────────────────────────────── */
  function openLightbox(images, startIndex, cfg) {
    if (_activePswp) { _activePswp.close(); _activePswp = null; }

    loadPS().then(function () {
      var thumbsVisible = cfg.thumbnails;
      var thumbHeight = cfg.thumbnailHeight;
      var captionBelow = cfg.showCaption && cfg.captionPosition === 'below';
      var captionBelowH = captionBelow ? 40 : 0;
      var thumbStripH = thumbHeight + 24;

      var pswp = new _PhotoSwipe({
        dataSource: images.map(function (img) {
          return {
            src: img.fullSrc || img.src,
            msrc: img.thumbSrc || img.src,
            width: img.width,
            height: img.height,
            alt: img.alt || ''
          };
        }),
        showHideAnimationType: cfg.transition === 'none' ? 'none' : 'fade',
        showAnimationDuration: 300,
        hideAnimationDuration: 250,
        bgOpacity: 1,
        maxZoomLevel: cfg.maxZoomLevel || 3,
        closeOnVerticalDrag: true,
        pinchToClose: true,
        loop: true,
        preload: [1, 2],
        arrowPrevSVG: cfg.customPrevArrow || ICONS.prevArrow,
        arrowNextSVG: cfg.customNextArrow || ICONS.nextArrow,
        closeSVG: cfg.customCloseIcon || ICONS.close,
        zoom: cfg.showZoom,
        counter: cfg.showCounter,
        index: startIndex,

        paddingFn: function (viewportSize) {
          var mobile = viewportSize.x < 768;
          var bottomPad = 10;
          var mobileThumbH = thumbHeight * 0.75 + 16;
          if (captionBelow && thumbsVisible) {
            bottomPad = (mobile ? mobileThumbH : thumbStripH) + captionBelowH;
          } else if (thumbsVisible) {
            bottomPad = mobile ? mobileThumbH : thumbStripH;
          } else if (captionBelow) {
            bottomPad = captionBelowH + 12;
          }
          return {
            top: mobile ? 50 : 10,
            bottom: bottomPad,
            left: mobile ? 0 : 10,
            right: mobile ? 0 : 10
          };
        }
      });

      _activePswp = pswp;

      /* ── custom UI ──────────────────────────── */
      pswp.on('uiRegister', function () {
        pswp.element.classList.add('sdl-lightbox');
        applyStyles(pswp.element, cfg);

        if (!cfg.showArrows) {
          pswp.element.classList.add('sdl-lb-no-arrows');
        }

        /* download button */
        if (cfg.showDownload) {
          pswp.ui.registerElement({
            name: 'sdl-download',
            order: 8,
            isButton: true,
            tagName: 'button',
            html: ICONS.download,
            title: 'Download image',
            className: 'sdl-lb-btn sdl-lb-download-btn',
            onClick: function () {
              downloadImage(images[pswp.currIndex]);
            }
          });
        }

        /* share button */
        if (cfg.showShare) {
          pswp.ui.registerElement({
            name: 'sdl-share',
            order: 9,
            isButton: true,
            tagName: 'button',
            html: ICONS.share,
            title: 'Copy link',
            className: 'sdl-lb-btn sdl-lb-share-btn',
            onClick: function () {
              var img = images[pswp.currIndex];
              var url = img.clickthroughUrl ? (location.origin + img.clickthroughUrl) : location.href;
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () {
                  showToast(pswp, 'Link copied!');
                });
              }
            }
          });
        }

        /* fullscreen button */
        if (cfg.showFullscreen) {
          pswp.ui.registerElement({
            name: 'sdl-fullscreen',
            order: 10,
            isButton: true,
            tagName: 'button',
            html: ICONS.fullscreen,
            title: 'Fullscreen',
            className: 'sdl-lb-btn sdl-lb-fullscreen-btn',
            onClick: function () {
              if (!document.fullscreenElement) {
                pswp.element.requestFullscreen().catch(function () {});
              } else {
                document.exitFullscreen();
              }
            }
          });
        }

        /* thumbnails toggle */
        if (cfg.thumbnails) {
          pswp.ui.registerElement({
            name: 'sdl-thumbs-toggle',
            order: 11,
            isButton: true,
            tagName: 'button',
            html: ICONS.thumbnails,
            title: 'Toggle thumbnails',
            className: 'sdl-lb-btn sdl-lb-thumbs-toggle',
            onClick: function () {
              thumbsVisible = !thumbsVisible;
              var wrap = pswp.element.querySelector('.sdl-lb-thumbs-wrap');
              if (wrap) wrap.classList.toggle('sdl-lb-thumbs--hidden', !thumbsVisible);
              pswp.updateSize(true);
            }
          });
        }

        /* image overlay */
        if (cfg.showOverlay) {
          pswp.ui.registerElement({
            name: 'sdl-overlay',
            className: 'sdl-lb-image-overlay',
            appendTo: 'wrapper',
            onInit: function (el) {
              el.style.background = cfg.overlayColor;
            }
          });
        }

        /* caption */
        if (cfg.showCaption) {
          var capPos = cfg.captionPosition || 'overlaid-bottom';
          pswp.ui.registerElement({
            name: 'sdl-caption',
            order: 100,
            isButton: false,
            appendTo: 'wrapper',
            className: 'sdl-lb-caption sdl-lb-caption--' + capPos,
            onInit: function (el) {
              function updateCap() {
                var cap = images[pswp.currIndex] ? images[pswp.currIndex].caption : '';
                el.textContent = cap;
                el.style.display = cap ? '' : 'none';
                if (capPos === 'below' && thumbsVisible) {
                  el.style.bottom = thumbStripH + 'px';
                } else if (capPos === 'below') {
                  el.style.bottom = '0';
                }
              }
              pswp.on('change', updateCap);
              updateCap();
            }
          });
        }

        /* thumbnail strip */
        if (cfg.thumbnails) {
          pswp.ui.registerElement({
            name: 'sdl-thumbnails',
            className: 'sdl-lb-thumbs-wrap',
            appendTo: 'wrapper',
            onInit: function (wrapEl) {
              var inner = document.createElement('div');
              inner.className = 'sdl-lb-thumbs';
              var thumbEls = [];

              images.forEach(function (img, idx) {
                var t = document.createElement('button');
                t.className = 'sdl-lb-thumb';
                t.setAttribute('aria-label', 'Go to slide ' + (idx + 1));
                if (idx === startIndex) t.classList.add('sdl-lb-thumb--active');

                var tImg = document.createElement('img');
                tImg.src = img.thumbSrc || img.src;
                tImg.alt = img.alt || '';
                tImg.loading = 'lazy';
                tImg.draggable = false;
                t.appendChild(tImg);

                t.addEventListener('click', function (e) {
                  e.stopPropagation();
                  pswp.goTo(idx);
                });

                inner.appendChild(t);
                thumbEls.push(t);
              });

              wrapEl.appendChild(inner);

              function updateActive() {
                thumbEls.forEach(function (t, i) {
                  t.classList.toggle('sdl-lb-thumb--active', i === pswp.currIndex);
                });
                var active = thumbEls[pswp.currIndex];
                if (active && inner.scrollTo) {
                  var scrollTarget = active.offsetLeft - (inner.clientWidth / 2) + (active.offsetWidth / 2);
                  inner.scrollTo({ left: scrollTarget, behavior: 'smooth' });
                }
              }

              pswp.on('change', updateActive);

              /* drag-scroll thumbnail strip */
              var sx = 0, sl = 0, dragging = false;
              inner.addEventListener('pointerdown', function (e) {
                if (e.target.closest('.sdl-lb-thumb')) return;
                dragging = true;
                sx = e.clientX;
                sl = inner.scrollLeft;
                inner.setPointerCapture(e.pointerId);
              });
              inner.addEventListener('pointermove', function (e) {
                if (!dragging) return;
                inner.scrollLeft = sl - (e.clientX - sx);
              });
              inner.addEventListener('pointerup', function () { dragging = false; });
              inner.addEventListener('pointercancel', function () { dragging = false; });

              /* mouse wheel scroll on thumbnail strip */
              inner.addEventListener('wheel', function (e) {
                if (e.ctrlKey) return;
                e.preventDefault();
                inner.scrollLeft += e.deltaY || e.deltaX;
              }, { passive: false });
            }
          });
        }
      });

      /* trackpad pinch-to-zoom */
      pswp.on('afterInit', function () {
        pswp.element.addEventListener('wheel', function (e) {
          if (!e.ctrlKey) return;
          e.preventDefault();
          var slide = pswp.currSlide;
          if (!slide) return;
          var curr = slide.currZoomLevel;
          var min = slide.zoomLevels.min;
          var max = slide.zoomLevels.max || (cfg.maxZoomLevel || 3);
          var factor = 1 - e.deltaY * 0.01;
          var next = Math.max(min, Math.min(max, curr * factor));
          slide.zoomTo(next, { x: e.clientX, y: e.clientY }, 100);
        }, { passive: false });
      });

      /* cleanup */
      pswp.on('destroy', function () {
        if (_activePswp === pswp) _activePswp = null;
      });

      pswp.init();
    }).catch(function (err) {
      console.error('[' + PLUGIN + '] Failed to load PhotoSwipe:', err);
    });
  }

  /* ── toast ────────────────────────────────────── */
  function showToast(pswp, msg) {
    var existing = pswp.element.querySelector('.sdl-lb-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.className = 'sdl-lb-toast';
    toast.textContent = msg;
    pswp.element.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('sdl-lb-toast--visible');
    });
    setTimeout(function () {
      toast.classList.remove('sdl-lb-toast--visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2000);
  }

  /* ── section init ─────────────────────────────── */
  function initSection(section) {
    var sid = section.id;
    var cfg = getConfigFor(sid);
    var images = extractImages(section);
    if (!images.length) return null;

    addIcons(section, images, cfg);

    var clickHandlers = [];
    images.forEach(function (img, idx) {
      var handler = function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openLightbox(images, idx, cfg);
      };
      img.element.addEventListener('click', handler, true);
      img.element.style.cursor = 'pointer';
      clickHandlers.push({ el: img.element, fn: handler });
    });

    return { section: section, images: images, handlers: clickHandlers, cfg: cfg };
  }

  /* ── destroy instance ─────────────────────────── */
  function destroyInstance(inst) {
    if (!inst) return;
    inst.handlers.forEach(function (h) {
      h.el.removeEventListener('click', h.fn, true);
      h.el.style.cursor = '';
    });
    removeIcons(inst.section);
  }

  /* ── plugin init ──────────────────────────────── */
  function init() {
    _instances.forEach(destroyInstance);
    _instances.length = 0;

    loadPSCSS();

    var sections = document.querySelectorAll('[id^="gallery-lightbox"]');
    sections.forEach(function (section) {
      if (!ID_RE.test(section.id)) return;
      var inst = initSection(section);
      if (inst) _instances.push(inst);
    });
  }

  /* ── editor compat ────────────────────────────── */
  if (window.top !== window.self) {
    var editObs = new MutationObserver(function () {
      if (document.body.classList.contains('sqs-edit-mode-active')) {
        _instances.forEach(destroyInstance);
        _instances.length = 0;
      }
    });
    editObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    var previewObs = new MutationObserver(function () {
      if (!document.body.classList.contains('sqs-edit-mode-active') && !_instances.length) {
        setTimeout(init, 200);
      }
    });
    previewObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── boot ─────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', function () {
    if (!_instances.length) init();
  });

  /* ── exports ──────────────────────────────────── */
  window.SDL_LIGHTBOX = { init: init, instances: _instances };
})();
