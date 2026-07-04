/* ==========================================================
   Manipuri Life - version-history pills (project-level).
   Loaded after slate.js in docs/index.html. Keeps the Slate
   engine untouched.

   Authoring: place a hidden history block as the LAST element of
   a section (right before the next <h2>/<h3>). It is not shown
   inline - a small "Version history" pill is injected at the
   section bottom, and clicking it opens a modal.

     <div class="slate-history" data-history-title="Section name">
       <div class="slate-history__entry" data-when="2026-07-04 10:40">
         <p class="slate-history__summary">Short summary of the change</p>
         <p>Longer context: why we changed it, what it was before.</p>
       </div>
       ... more entries ...
     </div>
   ========================================================== */
(function () {
  'use strict';

  function formatWhen(raw) {
    if (!raw) return '';
    var d = new Date(String(raw).replace(' ', 'T'));
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function openModal(title, entries) {
    var overlay = document.createElement('div');
    overlay.className = 'slate-history-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    var dialog = document.createElement('div');
    dialog.className = 'slate-history-dialog';

    var head = document.createElement('div');
    head.className = 'slate-history-dialog__head';
    var h = document.createElement('p');
    h.className = 'slate-history-dialog__title';
    h.textContent = title || 'Version history';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'slate-history-dialog__close';
    close.setAttribute('aria-label', 'Close version history');
    close.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close</span>';
    head.appendChild(h);
    head.appendChild(close);

    var body = document.createElement('div');
    body.className = 'slate-history-dialog__body';
    entries.forEach(function (e) {
      var item = document.createElement('div');
      item.className = 'slate-history-item';
      var when = document.createElement('p');
      when.className = 'slate-history-item__when';
      when.textContent = formatWhen(e.when);
      item.appendChild(when);
      if (e.summary) {
        var s = document.createElement('p');
        s.className = 'slate-history-item__summary';
        s.textContent = e.summary;
        item.appendChild(s);
      }
      if (e.body) {
        var b = document.createElement('div');
        b.className = 'slate-history-item__body';
        b.innerHTML = e.body;
        item.appendChild(b);
      }
      body.appendChild(item);
    });

    dialog.appendChild(head);
    dialog.appendChild(body);
    overlay.appendChild(dialog);

    function dismiss() {
      overlay.remove();
      document.body.classList.remove('slate-history-open');
      document.removeEventListener('keydown', onKey);
    }
    function onKey(ev) { if (ev.key === 'Escape') dismiss(); }
    close.addEventListener('click', dismiss);
    overlay.addEventListener('click', function (ev) { if (ev.target === overlay) dismiss(); });
    document.addEventListener('keydown', onKey);

    document.body.classList.add('slate-history-open');
    document.body.appendChild(overlay);
    close.focus();
  }

  function processHistory(root) {
    var blocks = (root || document).querySelectorAll('.slate-history:not([data-history-ready])');
    blocks.forEach(function (block) {
      block.setAttribute('data-history-ready', '1');
      var title = block.getAttribute('data-history-title') || 'Version history';
      var entries = [];
      block.querySelectorAll('.slate-history__entry').forEach(function (el) {
        var when = el.getAttribute('data-when') || '';
        var summaryEl = el.querySelector('.slate-history__summary');
        var clone = el.cloneNode(true);
        var sClone = clone.querySelector('.slate-history__summary');
        if (sClone) sClone.remove();
        entries.push({
          when: when,
          summary: summaryEl ? summaryEl.textContent.trim() : '',
          body: clone.innerHTML.trim()
        });
      });
      if (!entries.length) return;
      // Newest first.
      entries.sort(function (a, b) { return String(b.when).localeCompare(String(a.when)); });

      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'slate-history-pill';
      pill.setAttribute('aria-label', title + ' - ' + entries.length + ' revision' + (entries.length === 1 ? '' : 's'));
      pill.innerHTML =
        '<span class="material-symbols-outlined" aria-hidden="true">history</span>' +
        '<span>Version history</span>' +
        '<span class="slate-history-pill__count">' + entries.length + '</span>';
      pill.addEventListener('click', function () { openModal(title, entries); });

      block.parentNode.insertBefore(pill, block.nextSibling);
    });
  }

  function init() {
    var container = document.getElementById('document') || document.body;
    processHistory(container);
    var obs = new MutationObserver(function () { processHistory(container); });
    obs.observe(container, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
