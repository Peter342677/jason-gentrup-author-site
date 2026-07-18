import { bootApp } from '../core/app.js';

bootApp();

const form = document.getElementById('contact-form');
if (form) {
  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, message) {
    const wrapper = form.querySelector(`#${field}`).closest('.form-field');
    const errorEl = form.querySelector(`[data-error-for="${field}"]`);
    if (message) {
      wrapper.classList.add('has-error');
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      wrapper.classList.remove('has-error');
      errorEl.hidden = true;
    }
  }

  function validateClient(data) {
    let valid = true;
    if (!data.name.trim()) {
      setError('name', 'Please enter your name.');
      valid = false;
    } else setError('name', null);

    if (!EMAIL_RE.test(data.email)) {
      setError('email', 'Please enter a valid email address.');
      valid = false;
    } else setError('email', null);

    if (!data.message.trim() || data.message.trim().length < 10) {
      setError('message', 'Message must be at least 10 characters.');
      valid = false;
    } else setError('message', null);

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!validateClient(data)) {
      statusEl.textContent = 'Please fix the errors above.';
      statusEl.classList.add('error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, msg]) => setError(field, msg));
        }
        throw new Error(result.error || 'Please fix the errors above.');
      }

      form.reset();
      statusEl.textContent = "Thank you — your message has been sent. We'll be in touch soon.";
      statusEl.classList.add('success');
    } catch (err) {
      statusEl.textContent = err.message || 'Something went wrong. Please try again.';
      statusEl.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Now';
    }
  });
}
