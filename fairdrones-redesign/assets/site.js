/* FairDrones: script comune a tutte le pagine (italiano e inglese).
   Tema chiaro/scuro, menu su schermi piccoli, entrata delle sezioni,
   tab e invio dei moduli contatti (Netlify Forms). */
(() => {
  const CONTACT_EMAIL = 'info@fairdrones.it';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EN = document.documentElement.lang === 'en';
  const T = EN ? {
    hidden: { tipo: 'Contact type', lingua: 'Language' },
    sending: 'Sending…',
    ok: 'Thank you. Your message has been sent and we will reply as soon as possible.',
    local: href => `Sending only works on the site published on Netlify. <a href="${href}">Open a pre-filled email to ${CONTACT_EMAIL}</a>.`,
    fail: href => `The form could not be sent. <a href="${href}">Write to us directly at ${CONTACT_EMAIL}</a>.`,
    menu: 'Menu', close: 'Close'
  } : {
    hidden: { tipo: 'Tipo di contatto', lingua: 'Lingua' },
    sending: 'Invio in corso…',
    ok: 'Grazie! Il messaggio è stato inviato, ti risponderemo al più presto.',
    local: href => `L'invio funziona solo sul sito pubblicato su Netlify. <a href="${href}">Apri l'email già compilata per ${CONTACT_EMAIL}</a>.`,
    fail: href => `Non è stato possibile inviare il modulo. <a href="${href}">Scrivici direttamente a ${CONTACT_EMAIL}</a>.`,
    menu: 'Menu', close: 'Chiudi'
  };

  // Vecchi indirizzi della homepage (es. /#metodo): le sezioni ora sono nelle pagine di approfondimento
  if (document.body.dataset.page === 'home' && location.hash) {
    const MOVED = EN
      ? { metodo: 'how-it-works.html', software: 'technology.html', 'come-decide': 'how-it-works.html', fairbox: 'technology.html', ricerca: 'technology.html', progetto: 'about.html', team: 'about.html', collaboratori: 'about.html' }
      : { metodo: 'come-funziona.html', software: 'tecnologia.html', 'come-decide': 'come-funziona.html', fairbox: 'tecnologia.html', ricerca: 'tecnologia.html', progetto: 'chi-siamo.html', team: 'chi-siamo.html', collaboratori: 'chi-siamo.html' };
    const to = MOVED[location.hash.slice(1)];
    if (to) location.replace(to + location.hash);
  }

  // Menu su schermi piccoli
  (() => {
    const btn = document.querySelector('.menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!btn || !nav) return;
    const set = open => {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      btn.textContent = open ? T.close : T.menu;
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); } });
  })();


  // Tabs dei contatti (tastiera: frecce sinistra/destra)
  document.querySelectorAll('[data-tabs]').forEach(root => {
    const tabs = [...root.querySelectorAll('[role=tab]')];
    const select = (i, focus) => tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) t.focus({ preventScroll: true });
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i, true));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') select((i + 1) % tabs.length, true);
        if (e.key === 'ArrowLeft') select((i - 1 + tabs.length) % tabs.length, true);
        if (e.key === 'Home') { e.preventDefault(); select(0, true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    // I link #contatti-rifugi / #contatti-operatori / #contatti-enti aprono il tab giusto
    const HASH_TAB = { '#contatti-rifugi': 'tab-rifugi', '#contatti-operatori': 'tab-operatori', '#contatti-enti': 'tab-aziende' };
    const fromHash = () => {
      const id = HASH_TAB[location.hash];
      const i = tabs.findIndex(t => t.id === id);
      if (i > -1) select(i, false);
    };
    addEventListener('hashchange', fromHash);
    // un secondo clic sullo stesso link non cambia l'hash: riallinea comunque il tab
    document.querySelectorAll('a[href^="#contatti-"]').forEach(a => a.addEventListener('click', () => setTimeout(fromHash)));
    fromHash();
  });

  // Entrata a cascata: titolo, testo, immagine di ogni sezione
  const groups = new Map();
  document.querySelectorAll('[data-rise]').forEach(el => {
    const sec = el.closest('section') || document.body;
    if (!groups.has(sec)) groups.set(sec, []);
    const list = groups.get(sec);
    el.style.setProperty('--i', list.length);
    list.push(el);
  });
  // I contenuti sono visibili di default. Un elemento viene nascosto ("armato")
  // solo quando sta per entrare nello schermo, e compare quando ci entra:
  // se lo script non parte, o si salta a una sezione, non resta mai nulla di nascosto.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const rises = [...document.querySelectorAll('[data-rise]')];
    const show = el => { el.classList.add('in'); el.classList.remove('pre'); };
    const showIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { show(e.target); showIO.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    const arm = el => {
      if (el.classList.contains('in') || el.classList.contains('pre')) return;
      const top = el.getBoundingClientRect().top;
      if (top > innerHeight * 0.94 || scrollY < 10) { el.classList.add('pre'); showIO.observe(el); }
      else el.classList.add('in');
    };
    const armIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { arm(e.target); armIO.unobserve(e.target); }
    }), { rootMargin: '0px 0px 110% 0px' });
    rises.forEach(el => armIO.observe(el));
    // Se ci si allontana di nuovo (per esempio tornando in cima), l'elemento torna visibile
    let tick = 0;
    addEventListener('scroll', () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(() => {
        document.querySelectorAll('[data-rise].pre').forEach(el => {
          if (el.getBoundingClientRect().top > innerHeight * 2.3) { el.classList.remove('pre'); showIO.unobserve(el); armIO.observe(el); }
        });
      });
    }, { passive: true });
  }

  // Invio moduli con Netlify Forms.
  // Netlify registra i form al deploy (data-netlify) e inoltra ogni invio
  // a info@fairdrones.it tramite la notifica email impostata nel pannello.
  // Senza JS il form fa un normale POST e Netlify reindirizza a /grazie.html.
  document.querySelectorAll('.contact-form').forEach(form => {
    const status = form.querySelector('.form-status');
    const btn = form.querySelector('button[type=submit]');
    const SKIP = ['form-name', 'bot-field', 'subject'];

    const labelOf = el => form.querySelector(`label[for="${el.id}"]`)?.textContent.trim() || el.name;

    const mailtoLink = () => {
      const fields = [...form.elements].filter(el => el.name && !SKIP.includes(el.name) && el.type !== 'submit');
      const HIDDEN_LABELS = T.hidden;
      const body = fields.map(el => `${el.type === 'hidden' ? (HIDDEN_LABELS[el.name] || el.name) : labelOf(el)}: ${el.value}`).join('\n');
      const subject = form.elements.subject.value;
      return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const show = (type, html) => {
      status.className = 'form-status' + (type ? ' ' + type : '');
      status.innerHTML = html;
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      // Il campo trappola (bot-field) ferma i bot che inviano il form senza
      // eseguire JavaScript. Qui siamo in un browser vero: l'autocompilazione o
      // un'estensione possono riempirlo per errore e Netlify scarterebbe l'invio
      // come spam, quindi lo svuotiamo prima di spedire.
      const data = new FormData(form);
      if (data.get('bot-field')) console.info('[Form] bot-field filled by the browser: cleared before sending');
      data.set('bot-field', '');

      // Aprendo il file dal computer non c'è nessun server che riceva il form
      if (location.protocol === 'file:') {
        show('err', T.local(mailtoLink()));
        return;
      }

      btn.disabled = true;
      form.classList.add('is-sending');
      show('', T.sending);
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString()
        });
        console.info('[Form] risposta:', res.status, res.url, 'server:', res.headers.get('server'), 'redirect:', res.redirected);
        // Un redirect (es. fairdrones.it -> www.fairdrones.it) trasforma il POST in GET:
        // la risposta e' 200 ma Netlify non riceve nulla, quindi va trattato come errore.
        if (res.redirected) throw new Error('Richiesta reindirizzata a ' + res.url + ': il modulo non è stato ricevuto');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        show('ok', T.ok);
      } catch (err) {
        console.error('Invio modulo non riuscito:', err);
        show('err', T.fail(mailtoLink()));
      } finally {
        btn.disabled = false;
        form.classList.remove('is-sending');
      }
    });
  });

  // Tema chiaro / scuro
  (() => {
    const toggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;
    const isDark = () => (root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
    const sync = () => root.classList.toggle('is-dark', isDark());
    sync();
    toggleBtn?.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });
  })();
})();
