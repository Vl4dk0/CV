; (function() {
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
      .replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
  }

  const sessionId = uuidv4();
  const startTimeISO = new Date().toISOString();
  const startMs = Date.now();
  const endpoint = '/.netlify/functions/track';

  function send(evt, extra = {}, useBeacon = false) {
    const payload = {
      sessionId,
      event: evt,
      timestamp: new Date().toISOString(),
      timestampStart: startTimeISO,
      durationSec: Math.round((Date.now() - startMs) / 1000),
      ...extra
    };
    const body = JSON.stringify(payload);

    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      }).catch(() => { });
    }
  }

  // someone started viewing
  send('start');

  // someone left
  window.addEventListener('beforeunload', () => {
    send('end', {}, true);
  });
})();

