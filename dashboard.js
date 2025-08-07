document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const rol = payload.rol;

    if (rol === 'admin') {
        window.location.href = 'dashboard-admin.html';
    } else if (rol === 'doctor') {
        window.location.href = 'dashboard-doctor.html';
    } else if (rol === 'paciente') {
        window.location.href = 'dashboard-paciente.html';
    } else {
        alert('Rol desconocido 🫠');
        window.location.href = 'index.html';
    }
});
