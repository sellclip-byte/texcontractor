(function () {
  'use strict';
  // Contact initiation only: never fire this conversion on page load or sign-in.
  // The supplied value is a reporting value, not a payment or completed booking.
  const destination = 'AW-18516159223/3-f9CL3Jvp4dEPfVmP1E';
  const lastContact = new Map();
  function record(channel) {
    if (!['sms', 'call'].includes(channel) || typeof window.gtag !== 'function') return false;
    const now = Date.now();
    if (lastContact.has(channel) && now - lastContact.get(channel) < 1500) return false;
    try {
      window.gtag('event', 'conversion', {
        send_to: destination,
        value: 1.0,
        currency: 'USD',
        contact_method: channel
      });
      lastContact.set(channel, now);
      return true;
    } catch (_) {
      // Analytics must never prevent the existing SMS/call handoff.
      return false;
    }
  }
  window.TexContactTracking = Object.freeze({ record });
})();
