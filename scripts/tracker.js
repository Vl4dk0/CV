(function () {
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16),
    );
  }

  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem("sessionId", sessionId);
  }

  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("userId", userId);
  }
  console.log("userId", userId);

  let visitCount = parseInt(localStorage.getItem("visitCount") || "0", 10) + 1;
  localStorage.setItem("visitCount", visitCount.toString());

  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const endpoint = "/.netlify/functions/track";

  window.addEventListener("beforeunload", () => {
    const durationSec = Math.round((Date.now() - startedMs) / 1000);
    const interactions = sessionStorage.getItem("userInteractions") || "[]";
    const payload = {
      sessionId,
      userId,
      visitCount,
      event: "end",
      timestampStart: startedAt,
      timestamp: new Date().toISOString(),
      durationSec,
      interactions,
    };
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    }
  });
})();
