const API_BASE = 'http://localhost:3000/api';

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const correo = document.getElementById('loginCorreo').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, password })
  });
  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('token', data.token);
    const { rol } = JSON.parse(atob(data.token.split('.')[1]));
    if (rol === 'admin')      window.location.href = 'dashboard-admin.html';
    else if (rol === 'doctor') window.location.href = 'dashboard-doctor.html';
    else if (rol === 'paciente') window.location.href = 'dashboard-paciente.html';
    else alert('Rol desconocido 🤔');
  } else {
    alert(data.message || 'Error al iniciar sesión 😢');
  }
});

// REGISTRO
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;
  const rol = document.getElementById('rol').value;
  const tokenDoctor = document.getElementById('tokenDoctor').value || '';

  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, correo, password, rol, tokenDoctor })
  });
  const data = await res.json();

  if (res.ok) {
    alert('Registro exitoso 🎉');
    window.location.reload();
  } else {
    alert(data.message || 'Error al registrarse 😞');
  }
});

// TOGGLE de formularios
document.getElementById('showRegister').addEventListener('click', () => {
  document.querySelector('.login-container').style.display = 'none';
  document.getElementById('registerContainer').style.display = 'flex';
});
document.getElementById('backToLogin').addEventListener('click', () => {
  document.getElementById('registerContainer').style.display = 'none';
  document.querySelector('.login-container').style.display = 'flex';
});
document.getElementById('rol').addEventListener('change', e => {
  document.getElementById('tokenContainer').style.display =
    e.target.value === 'doctor' ? 'block' : 'none';
});
