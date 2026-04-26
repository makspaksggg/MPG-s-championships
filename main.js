const API = getApi();
let user = null;

// Таймер
async function refreshCountdown() {
  const res = await API.call('countdown');
  const t = document.getElementById('timer');
  if (res.seconds_remaining !== undefined) {
    const secs = res.seconds_remaining;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    t.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  } else {
    t.textContent = 'TBD';
  }
}
setInterval(refreshCountdown, 1000);
refreshCountdown();

// Новости
async function loadNews() {
  const res = await API.call('news');
  const container = document.getElementById('news-container');
  container.innerHTML = '';
  if (res.error) { container.innerText = 'Новости не загружены'; return; }
  res.news.forEach(item => {
    const div = document.createElement('div');
    div.className = 'news-item';
    div.innerHTML = `
      <strong>${item.title || '---'}</strong>
      <small>${new Date(item.created_at).toLocaleDateString()}</small>
      <p>${item.content}</p>
      ${item.image_url ? `<img src="${item.image_url}" alt="">` : ''}
      ${item.video_url ? `<video controls width="100%" src="${item.video_url}"></video>` : ''}
    `;
    container.appendChild(div);
  });
}
loadNews();

// Авторизация
const authForm = document.getElementById('auth-form');
const userPanel = document.getElementById('user-panel');

if (localStorage.getItem('user')) {
  user = JSON.parse(localStorage.getItem('user'));
  showLoggedIn();
}

async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const res = await API.call('login', { username, password });
  if (res.error) {
    document.getElementById('auth-msg').innerText = '❌ ' + res.error;
  } else {
    user = res;
    localStorage.setItem('user', JSON.stringify(user));
    showLoggedIn();
  }
}

async function register() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const email = document.getElementById('login-email').value;
  if (!username || !password) {
    document.getElementById('auth-msg').innerText = '❌ Все поля обязательны';
    return;
  }
  const res = await API.call('register', { username, password, email });
  if (res.error) {
    document.getElementById('auth-msg').innerText = '❌ ' + res.error;
  } else {
    document.getElementById('auth-msg').innerText = '✅ Регистрация успешна, войдите';
  }
}

function showLoggedIn() {
  authForm.classList.add('hidden');
  userPanel.classList.remove('hidden');
  document.getElementById('welcome-msg').innerText = `👾 ${user.username} (${user.role})`;
  if (user.role === 'admin') {
    const btn = document.createElement('button');
    btn.textContent = '⚙️ АДМИНКА';
    btn.onclick = () => window.location.href = 'admin.html';
    userPanel.appendChild(btn);
  }
}

function logout() {
  localStorage.removeItem('user');
  user = null;
  userPanel.classList.add('hidden');
  authForm.classList.remove('hidden');
  document.getElementById('auth-msg').innerText = '';
}

async function submitReg() {
  if (!user) return;
  const res = await API.call('submit_request', { user_id: user.user_id, token: user.token });
  alert(res.error || res.message);
}

// Уведомления
async function showNotifications() {
  if (!user) return;
  const res = await API.call('my_notifications', { token: user.token });
  const box = document.getElementById('notifications-box');
  const content = document.getElementById('notifications-content');
  box.classList.remove('hidden');
  content.innerHTML = '';
  if (res.error) { content.innerText = 'Ошибка загрузки'; return; }
  if (res.notifications.length === 0) {
    content.innerHTML = '<p>Нет уведомлений</p>';
    return;
  }
  res.notifications.forEach(n => {
    const div = document.createElement('div');
    div.className = 'notification';
    div.innerHTML = `
      <small>${new Date(n.created_at).toLocaleString()}</small>
      <p>${n.message}</p>
    `;
    content.appendChild(div);
  });
}

function hideNotifications() {
  document.getElementById('notifications-box').classList.add('hidden');
}