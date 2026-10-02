/**
 * Good Health and Well-Being - Authentication & User State
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbarAuth();
  initAuthForm();
});

function getLoggedInUser() {
  try {
    const raw = localStorage.getItem('gh_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function setLoggedInUser(user, token) {
  localStorage.setItem('gh_user', JSON.stringify(user));
  if (token) localStorage.setItem('gh_token', token);
  localStorage.removeItem('gh_custom_tasks'); // Force fresh sync for this user
  localStorage.setItem('gh_show_assessment_on_login', 'true'); // Triggers health assessment mini-screen
  renderNavbarAuth();
}

function logoutUser() {
  localStorage.removeItem('gh_user');
  localStorage.removeItem('gh_token');
  localStorage.removeItem('gh_custom_tasks');
  localStorage.removeItem('gh_selected_condition');
  localStorage.removeItem('gh_show_assessment_on_login');
  // Clear all cached task completion and state keys for complete user isolation
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('gh_ratio_') || k.startsWith('gh_state_')) {
      localStorage.removeItem(k);
    }
  });
  renderNavbarAuth();
  const loginForm = document.getElementById('auth-form');
  if (loginForm) loginForm.reset();
  window.location.reload();
}

function renderNavbarAuth() {
  const user = getLoggedInUser();
  const authNavContainers = document.querySelectorAll('.nav-auth-slot');

  authNavContainers.forEach(container => {
    if (user) {
      container.innerHTML = `
        <div class="nav-user-badge" title="${user.email}">
          <span class="user-avatar">${user.name.charAt(0).toUpperCase()}</span>
          <span>${user.name.split(' ')[0]}</span>
          <button class="btn-logout" onclick="logoutUser()" title="Sign Out">Sign Out</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <a href="login.html" class="nav-link nav-cta" style="padding: 0.45rem 1rem;">Sign In</a>
      `;
    }
  });
}

function initAuthForm() {
  const form = document.getElementById('auth-form');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const nameGroup = document.getElementById('group-name');
  const submitBtn = document.getElementById('btn-auth-submit');
  const formTitle = document.getElementById('auth-card-title');
  const formSubtitle = document.getElementById('auth-card-subtitle');
  const demoBtn = document.getElementById('btn-demo-login');
  const togglePassBtn = document.getElementById('btn-toggle-password');
  const passInput = document.getElementById('auth-password');

  if (!form) return;

  let currentMode = 'login';

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      currentMode = 'login';
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      if (nameGroup) nameGroup.style.display = 'none';
      if (formTitle) formTitle.textContent = 'Welcome Back';
      if (formSubtitle) formSubtitle.textContent = 'Sign in to access your saved wellness goals';
      if (submitBtn) submitBtn.textContent = 'Sign In to Your Account';
    });

    tabRegister.addEventListener('click', () => {
      currentMode = 'register';
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      if (nameGroup) nameGroup.style.display = 'block';
      if (formTitle) formTitle.textContent = 'Create Free Account';
      if (formSubtitle) formSubtitle.textContent = 'Join thousands taking proactive control of their well-being';
      if (submitBtn) submitBtn.textContent = 'Create Health Account';
    });
  }

  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passInput.getAttribute('type') === 'password';
      passInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePassBtn.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener('click', async () => {
        if (!window.HealthAPI) return alert('API not loaded.');
        
        let res = await window.HealthAPI.login('test@example.com', 'test1234');
        if (!res || !res.success) {
            res = await window.HealthAPI.register('Demo User', 'test@example.com', 'test1234');
        }
        
        if (res && res.success) {
            setLoggedInUser(res.user, res.token);
            alert('Welcome! You have successfully logged in with the Demo Account.');
            window.location.href = 'index.html';
        } else {
            alert('Demo login failed: ' + (res?.error || 'Server error'));
        }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const nameInput = document.getElementById('auth-name');
    const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : email.split('@')[0];

    if (!email || !password) {
      alert('Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (!window.HealthAPI) {
        alert('API Client not loaded. Cannot connect to server.');
        return;
    }

    let res;
    if (currentMode === 'register') {
      res = await window.HealthAPI.register(name, email, password);
    } else {
      res = await window.HealthAPI.login(email, password);
    }

    if (res && res.success) {
        setLoggedInUser(res.user, res.token);
        const welcomeMsg = currentMode === 'login' 
          ? `Welcome back, ${res.user.name}! Your wellness session is now active.`
          : `Congratulations ${res.user.name}! Your health account has been created.`;
        alert(welcomeMsg);
        window.location.href = 'index.html';
    } else {
        alert('Error: ' + (res?.error || 'Unable to communicate with server.'));
    }
  });
}
