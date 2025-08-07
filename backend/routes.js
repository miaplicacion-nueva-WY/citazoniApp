// backend/routes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY || 'citazioni_secret_key';

// 1) Conexión MySQL
const db = mysql.createConnection({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'citazioni_db'
});
db.connect(err => {
  if (err) console.error('Error conectando a la BD:', err);
  else    console.log('Conexión a MySQL exitosa!');
});

// 2) Middleware para parsear JSON: asegúrate de tener esto en tu server.js
//    app.use(express.json());

// 3) Middleware JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Token requerido' });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

// 4) Middleware solo-admin
const ensureAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores' });
    }
    next();
  }
];

// ————— 5) LOGIN —————
router.post('/login', (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password)
    return res.status(400).json({ message: 'Faltan datos' });

  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en la BD' });
    if (results.length === 0)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = results[0];
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    res.json({ token });
  });
});

// ————— 6) REGISTER —————
router.post('/register', async (req, res) => {
  const { nombre, correo, password, rol, tokenDoctor, especialidad } = req.body;
  if (!nombre || !correo || !password || !rol)
    return res.status(400).json({ message: 'Faltan datos' });
  if (rol === 'admin')
    return res.status(403).json({ message: 'No puedes registrarte como admin' });

  if (rol === 'doctor') {
    if (!tokenDoctor)
      return res.status(400).json({ message: 'Token de invitación requerido' });
    const [tokens] = await db
      .promise()
      .query(
        'SELECT * FROM tokens_doctor WHERE token = ? AND is_used = FALSE',
        [tokenDoctor]
      );
    if (tokens.length === 0)
      return res.status(403).json({ message: 'Token inválido o ya usado' });
    await db
      .promise()
      .query('UPDATE tokens_doctor SET is_used = TRUE WHERE token = ?', [tokenDoctor]);
  }

  const [existing] = await db
    .promise()
    .query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  if (existing.length > 0)
    return res.status(400).json({ message: 'El correo ya está registrado' });

  const hash = await bcrypt.hash(password, 10);
  await db
    .promise()
    .query(
      'INSERT INTO usuarios (nombre, correo, password, rol, especialidad) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hash, rol, rol === 'doctor' ? especialidad : null]
    );

  res.status(201).json({ message: 'Usuario registrado correctamente' });
});

// ————— 7) TOKEN DOCTOR (admin) —————
router.post('/generate-token', ensureAdmin, (req, res) => {
  const token = crypto.randomBytes(8).toString('hex');
  db.query('INSERT INTO tokens_doctor (token) VALUES (?)', [token], err => {
    if (err) return res.status(500).json({ message: 'Error al generar token' });
    res.status(201).json({ token });
  });
});

// ————— 8) CRUD USUARIOS (admin) —————
// Listar
router.get('/users', ensureAdmin, (req, res) => {
  const { rol } = req.query;
  db.query(
    'SELECT id, nombre, correo, rol, especialidad FROM usuarios WHERE rol = ?',
    [rol],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Error al listar usuarios' });
      res.json(results);
    }
  );
});
// Crear
router.post('/users', ensureAdmin, async (req, res) => {
  console.log('BODY EN POST /users:', req.body);
  const { nombre, correo, password, rol, especialidad } = req.body;
  if (!nombre || !correo || !password || !rol)
    return res.status(400).json({ message: 'Faltan datos' });
  if (!['doctor','paciente'].includes(rol))
    return res.status(400).json({ message: 'Rol inválido' });

  const [exists] = await db
    .promise()
    .query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
  if (exists.length)
    return res.status(400).json({ message: 'Correo ya existe' });

  const hash = await bcrypt.hash(password, 10);
  await db
    .promise()
    .query(
      'INSERT INTO usuarios (nombre, correo, password, rol, especialidad) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, hash, rol, rol==='doctor'?especialidad:null]
    );
  res.status(201).json({ message: 'Usuario creado' });
});
// Actualizar
router.put('/users/:id', ensureAdmin, async (req, res) => {
  console.log('BODY EN PUT /users/:id:', req.body);
  const { id } = req.params;
  const { nombre, correo, password, especialidad } = req.body;
  const fields = [];
  const params = [];

  if (nombre) { fields.push('nombre = ?'); params.push(nombre); }
  if (correo) { fields.push('correo = ?'); params.push(correo); }
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    fields.push('password = ?'); params.push(hash);
  }
  if ('especialidad' in req.body) {
    fields.push('especialidad = ?'); params.push(especialidad||null);
  }
  if (!fields.length)
    return res.status(400).json({ message: 'Nada para actualizar' });

  params.push(id);
  const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
  await db.promise().query(sql, params);
  res.json({ message: 'Usuario actualizado' });
});
// Eliminar
router.delete('/users/:id', ensureAdmin, (req, res) => {
  db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ message: 'Error al eliminar usuario' });
    res.json({ message: 'Usuario eliminado' });
  });
});

// ————— 9) ESPECIALIDADES FIJAS —————
router.get('/specialties', verifyToken, (req, res) => {
  res.json([
    'General',
    'Pedagogía',
    'Ginecología',
    'Neurología',
    'Cardiología'
  ]);
});

// ————— 10) DOCTORES —————
router.get('/doctors', verifyToken, (req, res) => {
  const { especialidad } = req.query;
  let sql, params;
  if (especialidad) {
    sql = "SELECT id, nombre FROM usuarios WHERE rol='doctor' AND especialidad = ?";
    params = [especialidad];
  } else {
    sql = "SELECT id, nombre, especialidad FROM usuarios WHERE rol='doctor'";
    params = [];
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener doctores' });
    res.json(results);
  });
});

// ————— 11) CITAS PACIENTE —————
router.post('/appointments', verifyToken, (req, res) => {
  const paciente_id = req.user.id;
  const { doctor_id, fecha, hora, motivo } = req.body;
  if (!doctor_id || !fecha || !hora)
    return res.status(400).json({ message: 'Faltan datos para agendar' });

  db.query(
    'INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo) VALUES (?,?,?,?,?)',
    [paciente_id, doctor_id, fecha, hora, motivo],
    err => {
      if (err) return res.status(500).json({ message: 'Error al agendar cita' });
      res.status(201).json({ message: 'Cita agendada correctamente' });
    }
  );
});
router.get('/appointments', verifyToken, (req, res) => {
  const paciente = req.query.paciente;
  const sql = `
    SELECT c.id, c.fecha, c.hora, c.motivo, u.nombre AS nombre_doc
    FROM citas c
    JOIN usuarios u ON c.doctor_id = u.id
    WHERE c.paciente_id = ?
    ORDER BY c.fecha DESC, c.hora DESC
  `;
  db.query(sql, [paciente], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener citas' });
    res.json(results);
  });
});

// ————— 12) CITAS DOCTOR —————
router.get('/appointments/doctor', verifyToken, (req, res) => {
  if (req.user.rol !== 'doctor')
    return res.status(403).json({ message: 'Solo doctores' });

  const sql = `
    SELECT c.id, c.fecha, c.hora, c.motivo, u.nombre AS paciente
    FROM citas c
    JOIN usuarios u ON c.paciente_id = u.id
    WHERE c.doctor_id = ?
    ORDER BY c.fecha DESC, c.hora DESC
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener citas' });
    res.json(results);
  });
});

module.exports = router;
