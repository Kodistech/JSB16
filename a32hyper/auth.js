const ACCOUNTS_KEY = 'xa_accounts';
const DATA_FILE = 'accounts.json';

const messageEl = document.getElementById('auth-message');
let accounts = [];

function showMessage(text, type = 'info') {
  if (!messageEl) return;
  messageEl.textContent = text;
  messageEl.className = 'auth-message ' + type;
}

function clearMessage() {
  if (!messageEl) return;
  messageEl.textContent = '';
  messageEl.className = 'auth-message';
}

async function loadAccounts() {
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn('Invalid saved accounts, resetting local storage.');
      localStorage.removeItem(ACCOUNTS_KEY);
    }
  }

  try {
    const response = await fetch(DATA_FILE);
    if (!response.ok) throw new Error('Failed to load accounts.json');
    const data = await response.json();
    if (Array.isArray(data)) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(data));
      return data;
    }
  } catch (error) {
    console.warn(error);
  }

  return [];
}

function saveAccounts(updatedAccounts) {
  accounts = updatedAccounts;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function findAccount(loginValue) {
  const normalized = loginValue.trim().toLowerCase();
  return accounts.find(account =>
    account.username.toLowerCase() === normalized || account.email.toLowerCase() === normalized
  );
}

function createAccount(formData) {
  const username = formData.get('username').trim();
  const email = formData.get('email').trim();
  const fullname = formData.get('fullname').trim();
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const gender = formData.get('gender');

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  if (findAccount(username) || findAccount(email)) {
    showMessage('Username or email already exists.', 'error');
    return;
  }

  const newAccount = {
    fullname,
    email,
    username,
    password,
    gender,
  };

  saveAccounts([...accounts, newAccount]);
  showMessage('Account created successfully. You may now log in.', 'success');
  document.getElementById('register-form').reset();
}

function loginAccount(formData) {
  const loginValue = formData.get('username').trim();
  const password = formData.get('password');
  const account = findAccount(loginValue);

  if (!account || account.password !== password) {
    showMessage('Login failed: invalid username/email or password.', 'error');
    return;
  }

  showMessage(`Welcome back, ${account.fullname || account.username}!`, 'success');
  document.getElementById('login-form').reset();
  
  // Redirect to main.html after 1 second
  setTimeout(() => {
    window.location.href = 'main.html';
  }, 1000);
}

function showTab(tabName, button) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.remove('active'));

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName + '-form').classList.add('active');
  if (button) button.classList.add('active');
  clearMessage();
}

function attachListeners() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabButtons = document.querySelectorAll('.tab-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', event => {
      event.preventDefault();
      clearMessage();
      loginAccount(new FormData(loginForm));
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', event => {
      event.preventDefault();
      clearMessage();
      createAccount(new FormData(registerForm));
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', () => showTab(button.dataset.tab, button));
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  accounts = await loadAccounts();
  attachListeners();
});
