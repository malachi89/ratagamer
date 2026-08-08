# RataGamer 🎮

Diario de gaming privado para una pareja. Registra los juegos que juegan, tus personajes (con su nombre de granja si aplica 😄), sube imágenes y escribe entradas del diario con notas, fechas y horas jugadas.

## Funcionalidades

- **Login privado** con Google OAuth y whitelist de correos (sesión JWT segura, cookie httpOnly)
- **Juegos**: título, plataforma, estado, calificación, fechas, notas y portada
- **Personajes**: nombre, nombre de granja, foto y descripción
- **Diario**: entradas por juego con fecha, horas jugadas, título y notas
- **Subida de imágenes**: portadas de juegos y fotos de personajes (JPG, PNG, WEBP, GIF, máx 15 MB)
- Los archivos se guardan fuera de `public` y solo se sirven a usuarios autenticados
- Borrado en cascada: al eliminar un juego se eliminan sus personajes, entradas e imágenes

## Stack

- Next.js 16 (App Router, Server Actions)
- SQLite (`better-sqlite3`)
- Autenticación con Google OAuth + JWT (`jose`)
- Sin ORM, SQL directo

## Desarrollo local

```bash
npm install
cp .env.example .env   # edita AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET y GOOGLE_ALLOWED_EMAILS
npm run dev            # http://localhost:3000
```

El acceso es **solo con Google**: al iniciar sesión, si el correo está en `GOOGLE_ALLOWED_EMAILS` se crea el usuario automáticamente (o se reutiliza el existente). La whitelist actual es `saicasvn@gmail.com` y `du.krolita@gmail.com`.

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
GOOGLE_CLIENT_ID=TU_CLIENT_ID
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET
GOOGLE_ALLOWED_EMAILS=saicasvn@gmail.com,du.krolita@gmail.com
GOOGLE_REDIRECT_URI=https://TU_DOMINIO/api/auth/google/callback
EOF

docker compose up -d --build
```

La app quedará en `http://TU_SERVIDOR:3000`. Los datos (base de datos e imágenes) se guardan en el volumen `ratagamer-data` y sobreviven a los rebuilds.

### Con PM2 / next start

```bash
# en el servidor (una sola vez)
git clone https://github.com/malachi89/ratagamer.git
cd ratagamer
npm install
cp .env.example .env   # edita AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, GOOGLE_ALLOWED_EMAILS y GOOGLE_REDIRECT_URI
npm run build
pm2 start npm --name ratagamer -- start
pm2 save && pm2 startup   # para que sobreviva reinicios del servidor
```

Para desplegar una actualización:

```bash
cd ratagamer
git pull origin dev
npm install          # por si cambiaron dependencias
npm run build
pm2 restart ratagamer
```

Notas:
- El directorio `data/` (base de datos e imágenes) está en `.gitignore`, así que el `git pull` no toca tus datos.
- Ver logs: `pm2 logs ratagamer` · estado: `pm2 list`.
- Verificar que responda: `curl -I http://localhost:3000` (debe devolver `200`).

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

- Solo los correos de la whitelist (`GOOGLE_ALLOWED_EMAILS`) pueden iniciar sesión
- Sesión JWT firmada, cookie `httpOnly` + `sameSite`
- Las imágenes se sirven solo tras verificación de sesión y con nombre de archivo saneado (sin path traversal)
- Validación de tipo y tamaño en subidas

## Scripts

- `npm run dev` — desarrollo
- `npm run build` / `npm run start` — producción
