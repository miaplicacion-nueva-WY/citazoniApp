function generarToken() {
  const token = localStorage.getItem('token');

  fetch('http://localhost:3000/generate-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      document.getElementById('mensaje-token').textContent = `Token generado: ${data.token}`;
    } else {
      document.getElementById('mensaje-token').textContent = data.message || 'No se pudo generar el token';
    }
  })
  .catch(err => {
    console.error(err);
    document.getElementById('mensaje-token').textContent = 'Error al generar token';
  });
}
