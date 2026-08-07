# RataGamer 🎮

Diario de gaming privado para una pareja. Registra los juegos que juegan, tus personajes (con su nombre de granja si aplica 😄), sube imágenes y escribe entradas del diario con notas, fechas y horas jugadas.

## Funcionalidades

- **Login privado** para 2 usuarios (sesión JWT segura, cookie httpOnly)
- **Juegos**: título, plataforma, estado, calificación, fechas, notas y portada
- **Personajes**: nombre, nombre de granja, foto y descripción
- **Diario**: entradas por juego con fecha, horas jugadas, título y notas
- **Subida de imágenes**: portadas de juegos y fotos de personajes (JPG, PNG, WEBP, GIF, máx 15 MB)
- Los archivos se guardan fuera de `public` y solo se sirven a usuarios autenticados
- Borrado en cascada: al eliminar un juego se eliminan sus personajes, entradas e imágenes

## Stack

- Next.js 16 (App Router, Server Actions)
- SQLite (`better-sqlite3`)
- Autenticación con JWT (`jose`) + bcrypt
- Sin ORM, SQL directo

## Desarrollo local

```bash
npm install
cp .env.example .env   # edita AUTH_SECRET y contraseñas
npm run seed           # crea/actualiza los 2 usuarios (opcional, se auto-crean)
npm run dev            # http://localhost:3000
```

Los usuarios iniciales (si la base de datos está vacía):

- `malachi` / `cambiar123`
- `esposa` / `cambiar123`

> **Cambia las contraseñas** definiendo `SEED_PASSWORD_1` y `SEED_PASSWORD_2` en el `.env` antes del primer arranque, o borra la carpeta `data/` para regenerar.

## Despliegue en VPS (Docker)

```bash
# en el servidor
git clone https://github.com/malachi89/ratagamer.git
cd ratagamer

# genera un secreto y edita docker-compose.yml
openssl rand -base64 32

# crea el archivo .env
cat > .env <<EOF
AUTH_SECRET=TU_SECRETO_GENERADO
SEED_PASSWORD_1=contraseña_de_malachi
SEED_PASSWORD_2=contraseña_de_esposa
EOF

docker compose up -d --build
```

La app quedará en `http://TU_SERVIDOR:3000`. Los datos (base de datos e imágenes) se guardan en el volumen `ratagamer-data` y sobreviven a los rebuilds.

### Con Caddy/nginx como proxy reverso + HTTPS

```bash
# Caddyfile
tudiario.com {
    reverse_proxy localhost:3000
}
```

## Estructura

```
app/
  actions/        Server Actions (auth, datos)
  api/files/      Servir imágenes autenticadas
  dashboard/      Inicio con resumen y entradas recientes
  games/          Lista, detalle, crear y editar juegos
  login/          Página de login
components/       UI (formularios, listas, header)
lib/              db, auth (JWT), archivos (uploads)
proxy.ts          Protección de rutas (autenticación)
```

## Seguridad

- Solo los 2 usuarios con sesión válida pueden acceder a las rutas (`proxy.ts`)
- Contraseñas con bcrypt
- Sesión JWT firmada, cookie `httpOnly` + `sameSite`
- Las imágenes se sirven solo tras verificación de sesión y con nombre de archivo saneado (sin path traversal)
- Validación de tipo y tamaño en subidas

## Scripts

- `npm run dev` — desarrollo
- `npm run build` / `npm run start` — producción
- `npm run seed` — crear/actualizar usuarios
