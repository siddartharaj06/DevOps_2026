const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

async function checkExistingSession() {
  try {
    const res = await fetch('/auth/me');
    if (res.ok) {
      window.location.href = '/';
    }
  } catch (err) {
    console.error('Session check failed:', err);
  }
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';

  const formData = new FormData(loginForm);
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  if (!username || !password) {
    loginError.textContent = 'Username and password are required.';
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      loginError.textContent = data.error || 'Login failed. Please try again.';
      return;
    }

    window.location.href = '/';
  } catch (err) {
    console.error(err);
    loginError.textContent = 'Unable to sign in right now. Please try again.';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
  }
});

checkExistingSession();
