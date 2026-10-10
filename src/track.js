/* Scamper — anonymous play counts. window.MT

   Enough to answer three questions — do people finish a garden, do they share
   it, do they come back the next day — and nothing more.

   What is sent: an event name and a few game facts ("finish", mode daily,
   mood hungry, 2 stars, beat par). What is never sent or kept: cookies, names,
   any device or user ID, anything typed. Whether someone came back is worked
   out here on the device from their own streak and sent only as a bucket
   ("yesterday"), so no visitor ever has to be recognised.

   Nothing at all is sent unless:
     - the build was given an analytics provider (build/config.json),
     - the game is being served from a web address (never from a file),
     - the browser is not asking for Do Not Track or Global Privacy Control,
     - and the player has not turned "Anonymous stats" off in Settings.

   Two cookieless providers are supported: Plausible (events API) and
   GoatCounter (count API). */
(function () {
  const C = window.__scamper || {};
  const A = C.analytics || null;

  function allowed() {
    if (!A) return false;
    try {
      if (!/^https?:$/.test(location.protocol)) return false;
      if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true) return false;
      const s = JSON.parse(localStorage.getItem('scamper_settings') || 'null');
      if (s && s.stats === false) return false;
    } catch (e) { /* storage blocked: the setting cannot have been turned off */ }
    return true;
  }

  function send(name, props) {
    const page = location.origin + location.pathname;
    if (A.provider === 'plausible') {
      fetch(A.endpoint || 'https://plausible.io/api/event', {
        method: 'POST', keepalive: true, credentials: 'omit',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ name, url: page, domain: A.domain, props: props || {} }),
      }).catch(() => {});
    } else if (A.provider === 'goatcounter') {
      /* GoatCounter has no event properties, so they ride in the path:
         finish/daily/hungry/2-stars */
      const bits = [name].concat(Object.keys(props || {}).map((k) => k + '-' + props[k]));
      const q = 'p=' + encodeURIComponent(name === 'pageview' ? location.pathname : bits.join('/')) +
        '&e=' + (name === 'pageview' ? 'false' : 'true') + '&rnd=' + Math.random().toString(36).slice(2);
      fetch('https://' + A.code + '.goatcounter.com/count?' + q, { mode: 'no-cors', keepalive: true, credentials: 'omit' }).catch(() => {});
    }
  }

  window.MT = {
    configured: !!A,
    provider: A ? A.provider : null,
    track(name, props) {
      if (!allowed()) return;
      try { send(name, props); } catch (e) { /* never let counting break a game */ }
    },
  };
})();
