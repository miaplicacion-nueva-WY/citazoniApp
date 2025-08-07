# 📋 Citazioni App

¡Bienvenido a **Citazioni App**!  
Una plataforma web para gestionar citas médicas de manera sencilla, segura y con un toque fresa. Con roles de **admin**, **doctor** y **paciente**, autenticación con JWT, encriptación de contraseñas, tokens de invitación para doctores y más.

---

## 📑 Tabla de contenidos

- [Descripción](#descripción)  
- [Tecnologías](#tecnologías)  
- [Requisitos Previos](#requisitos-previos)  
- [Instalación](#instalación)  
- [Configuración](#configuración)  
- [Base de Datos](#base-de-datos)  
- [Estructura de Carpetas](#estructura-de-carpetas)  
- [Ejecución](#ejecución)  
- [Uso](#uso)  
- [Despliegue](#despliegue)  
- [Contribuir](#contribuir)  
- [Licencia](#licencia)  
- [Contacto](#contacto)  

---

## 📝 Descripción

Citazioni App es una aplicación full-stack que permite:
- Registrar usuarios con roles **admin**, **doctor** y **paciente**.  
- Autenticación segura con **JWT** y **bcrypt**.  
- Multifactores: recuperación de contraseña, encriptación de endpoints y datos JSON.  
- Generar tokens de invitación para registro de doctores.  
- CRUD de usuarios desde el panel de admin.  
- Agendar citas: pacientes eligen especialidad y doctor; doctores consultan sus citas.

---

## 🛠 Tecnologías

- **Backend:** Node.js, Express, MySQL (mysql2), JWT, bcrypt  
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API)  
- **Servidor de BD:** XAMPP / phpMyAdmin (MySQL)  
- **Control de versiones:** Git & GitHub  

---

## ⚙️ Requisitos Previos

Antes de empezar, asegúrate de tener instalados:

- **Node.js (v14+)** y **npm**  
- **XAMPP** (Apache + MySQL + phpMyAdmin)  
- (Opcional) **Git**  

---

## 🚀 Instalación

1. **Clona el repositorio**  
   ```bash
   git clone https://github.com/TU_USUARIO/citazoniApp.git
   cd citazoniApp
   ```

2. **Inicializa Git** (si aún no lo hiciste)  
   ```bash
   git init
   ```

3. **Ignora archivos sensibles**  
   Crea **`.gitignore`** en la raíz:
   ```
   node_modules/
   .env
   ```

---

## 🔧 Configuración

1. Dentro de `backend/`, crea un archivo **`.env`** con:
   ```env
   PORT=3000
   SECRET_KEY=tu_clave_secreta
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=
   DB_NAME=citazioni_db
   ```
2. Instala dependencias:
   ```bash
   cd backend
   npm install
   ```

---

## 🗄️ Base de Datos

1. Abre **phpMyAdmin** en `http://localhost/phpmyadmin`.  
2. Crea la base de datos **`citazioni_db`**.  
3. Importa este script SQL:
   ```sql
   CREATE TABLE usuarios (
     id INT AUTO_INCREMENT PRIMARY KEY,
     nombre VARCHAR(100) NOT NULL,
     correo VARCHAR(100) NOT NULL UNIQUE,
     password VARCHAR(255) NOT NULL,
     rol ENUM('admin','doctor','paciente') NOT NULL,
     especialidad VARCHAR(100) NULL
   );
   CREATE TABLE tokens_doctor (
     id INT AUTO_INCREMENT PRIMARY KEY,
     token VARCHAR(50) NOT NULL,
     is_used BOOLEAN DEFAULT FALSE
   );
   CREATE TABLE citas (
     id INT AUTO_INCREMENT PRIMARY KEY,
     paciente_id INT NOT NULL,
     doctor_id INT NOT NULL,
     fecha DATE NOT NULL,
     hora TIME NOT NULL,
     motivo TEXT,
     FOREIGN KEY (paciente_id) REFERENCES usuarios(id),
     FOREIGN KEY (doctor_id)  REFERENCES usuarios(id)
   );
   ```

---

## 📂 Estructura de Carpetas

```
citazoniApp/
├── backend/
│   ├── .env
│   ├── routes.js
│   ├── server.js
│   ├── package.json
│   └── node_modules/  
└── public/
    ├── index.html
    ├── quienes-somos.html
    ├── dashboard-admin.html
    ├── dashboard-doctor.html
    ├── dashboard-paciente.html
    ├── styles.css
    └── main.js
```

---

## ▶️ Ejecución

1. Levanta XAMPP (Apache + MySQL).  
2. Desde `backend/`:
   ```bash
   node server.js
   ```
   Deberías ver:
   ```
   Conexión a MySQL exitosa!
   Servidor corriendo en http://localhost:3000
   ```
3. Abre en tu navegador `http://localhost:3000/index.html`.

---

## 🎬 Uso

1. **Admin**  
   - Inicia sesión con tu usuario admin.  
   - Genera tokens de invitación para doctores.  
   - CRUD de doctores y pacientes.

2. **Doctor**  
   - Regístrate usando un token válido.  
   - Inicia sesión, ve tu dashboard y revisa tus citas.

3. **Paciente**  
   - Regístrate (rol “paciente”).  
   - En tu dashboard, elige especialidad, doctor, fecha y hora.  
   - Consulta tu historial de citas.

---

## ☁️ Despliegue

Para producción, considera:

- Backend en Heroku, DigitalOcean, AWS, etc.  
- Base de datos MySQL gestionada (ClearDB, Amazon RDS).  
- Frontend en Netlify, Vercel o S3 + CloudFront.  
