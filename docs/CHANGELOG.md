# Changelog — Preparación para producción (scorpio.cpsrtc.cl)

Registro de los cambios implementados para el despliegue en `scorpio.cpsrtc.cl` (CloudFront + WAF delante de un origen nginx). Incluye cambios en `scorpio-frontend` y, donde corresponde, los cambios coordinados en `scorpio-backend` necesarios para que el conjunto funcione.

## 2026-10-02

### CI/CD

- `.github/workflows/ci.yml`: instala dependencias con lockfile, ejecuta ESLint sin warnings y compila con `VITE_API_URL=/api`. Se activa solo en PRs hacia `development` o `main`. El proyecto usa JS/JSX; no incluye chequeo de tipos TypeScript.
- `.github/workflows/cd.yml`: se activa solo cuando se mergea un PR en `main` (`pull_request_target` `closed`; usa el `cd.yml` de la rama predeterminada `main`, así un PR no puede alterar los pasos de despliegue; el workflow debe estar en `main` para dispararse) y, en el runner self-hosted `scorpio-frontend`, despliega el SHA del merge en `/opt/SCORPIO/scorpio-frontend` con `docker compose up -d --build --wait` y verifica `/healthz`.
- Healthcheck (`Dockerfile` y `docker-compose.yml`): `http://localhost/healthz` → `http://127.0.0.1/healthz`. En Alpine `localhost` resolvía a `::1` y nginx solo escucha IPv4, dejando el contenedor `unhealthy`.
- `docs/CICD.md`: documenta los workflows, las reglas de merge y la configuración pendiente de despliegue.

### Fixes en servicios

- `src/services/packetService.js`: agrega una base absoluta al constructor `URL` para admitir `VITE_API_URL=/api`, evitando `Invalid URL` al consultar paquetes.
- `src/services/satelliteService.js`: aplica la misma corrección al listado de satélites, conservando los parámetros de búsqueda y paginación.

## 2026-09-24

### Modo de registro (signup mode)
- `src/services/authService.js`: nuevo `getAuthConfig()` que consulta `GET /auth/config` y devuelve `signupMode` (`public` | `admin`). Ante error de red, respuesta inválida o valor desconocido cae al default seguro `admin` (registro deshabilitado).
- `src/hooks/useSignupMode.js`: nuevo hook que expone `{ signupMode, loading }`, con la promesa de configuración cacheada a nivel de módulo (una sola request por carga de página).
- `src/app/App.jsx`: la ruta `/signup` muestra `SignupDisabled` (mensaje + link a login) cuando el modo no es `public`.
- `src/pages/Login/Login.jsx` y `src/components/NavBar/elements/Menu/Menu.jsx`: el botón "New account" y el link "Register" solo se muestran con modo `public`.
- `src/pages/SignUp/SignUp.jsx`: si el backend responde `403` al registrar, se muestra el mensaje de registro deshabilitado en vez de un error genérico.
- `authService.js`: los errores lanzados ahora incluyen `error.status` con el código HTTP.
- `src/pages/Login/Login.css`: nueva variante `.auth-form__message--info`.

### Dashboard: gestión de usuarios (admin)
- `src/services/userService.js`: nuevo `createUser(payload)` → `POST /users`.
- `src/pages/Dashboard/Dashboard.jsx`: formulario "Create user" en el panel admin (name, email, password, type).
- Tipo de usuario por defecto renombrado de `user` a `normal`, alineado con el backend.
- Al editar un usuario, `type` solo se envía en el payload si cambió.

### Branding
- `public/cps-rtc-horizontal-white.svg`: logo CPS-RTC.
- `AuthCard` y `NavBar`: bloque "Powered by CPS-RTC" con link a `https://cpsrtc.cl` (en móvil el NavBar oculta el texto y deja solo el logo).

### Fix: casing de imports
- `NavBar.jsx` y `LandingPage.jsx`: imports corregidos (`Navbar` → `NavBar`, `NavbarContext` → `NavBarContext`) para coincidir con los nombres reales de archivo. Funcionaba en FS case-insensitive pero rompía el build en Linux/Docker.

### Tooling
- `package.json`: se agregó `packageManager: yarn@1.22.22`.

## 2026-09-23

### Healthcheck (Docker)
- `nginx.conf`: nuevo endpoint `location = /healthz` (200 "ok", sin `access_log`), independiente del fallback SPA y del bundle de la app.
- `Dockerfile`: `HEALTHCHECK` sobre `wget --spider http://localhost/healthz` (interval 30s, timeout 3s, retries 3, start_period 5s).
- `docker-compose.yml`: bloque `healthcheck` equivalente en el servicio `frontend`.
- Alcance: solo producción (`Dockerfile` / `docker-compose.yml`). `Dockerfile.dev` / `docker-compose.dev.yml` quedaron sin cambios.

### Fix `VITE_API_URL`
- `VITE_API_URL` es un valor de **build-time** que queda embebido en el bundle JS que corre en el navegador — no es una variable de entorno de runtime del contenedor.
- Antes apuntaba a `http://host-gateway:3000`, un hostname que ni siquiera coincidía con el `extra_hosts` de compose (que mapeaba `host.docker.internal`, no `host-gateway`) y que ningún navegador podría resolver.
- `.env`: ahora `VITE_API_URL=/api` (ruta relativa al mismo origen, ya que nginx expone `/api` en el mismo dominio que el sitio).
- `docker-compose.yml`: el build arg pasó de tener un default silencioso (`${VITE_API_URL:-http://localhost:3000}`) a ser obligatorio (`${VITE_API_URL:?...}`), para que un build sin la variable falle en vez de hornear `localhost` en producción por error.
- `.env.example`: documentado el contraste entre valor de desarrollo (`http://localhost:3000/api`) y de producción (`/api`, detrás de nginx en el mismo dominio).
- Se eliminó el `extra_hosts: host.docker.internal:host-gateway` del `docker-compose.yml` de producción: el contenedor nginx nunca llama él mismo al backend (todas las llamadas API/WebSocket las hace el navegador), así que esa entrada era vestigial.

> Nota operativa: se detectó que el contenedor `scorpio-frontend-frontend-1` en ejecución seguía usando una imagen de 2 semanas atrás (anterior a todos estos cambios), por lo que seguía sirviendo el bundle viejo con `http://localhost:3000` embebido. **Pendiente: redeploy** (`docker compose up -d`) para que el contenedor tome la imagen e imagen/env actualizados.

### nginx: proxy hacia el backend + hardening (coordinado con scorpio-backend)
- `nginx.conf` (reescrito por la sesión de backend, revisado y reconciliado aquí):
  - Rendereado por el entrypoint de la imagen oficial de nginx vía `envsubst` (`/etc/nginx/templates/default.conf.template`).
  - `location /api/` y `location /api/socket.io/` proxied hacia `http://api:3000` (con soporte de upgrade para WebSocket).
  - Chequeo de origen: `X-Origin-Verify` (header custom que envía CloudFront) validado contra `ORIGIN_SECRET`; si no coincide, `403`. Con `ORIGIN_SECRET` vacío el chequeo queda deshabilitado.
  - `/healthz` exento del chequeo de origen (los health checks no llevan ese header).
  - Headers de seguridad agregados: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`, `Content-Security-Policy: frame-ancestors 'none'`.
- `Dockerfile`: `nginx.conf` ahora se copia a `/etc/nginx/templates/default.conf.template` (antes iba directo a `conf.d/default.conf`), requerido por el mecanismo de `envsubst` de la imagen oficial.
- `docker-compose.yml`: se agregó `environment: ORIGIN_SECRET: ${ORIGIN_SECRET:-}` para que el template pueda sustituir el valor.
- `.env` / `.env.example`: se agregó `ORIGIN_SECRET=` (vacío por defecto — **pendiente**: cargar el valor real una vez configurado el custom origin header en CloudFront).

### Frontend: rutas y contrato de API actualizado
- `src/services/*.js` y `src/libs/socket.js`: fallback de desarrollo actualizado a `http://localhost:3000/api` (antes `http://localhost:3000`), alineado con el nuevo prefijo `/api` de todas las rutas del backend.
- `src/libs/socket.js`: ahora resuelve origin y path del socket a partir de `VITE_API_URL` (soporta valores relativos o absolutos) y conecta a `<api path>/socket.io`, en línea con que el backend ahora sirve Socket.IO en `/api/socket.io`.

### Networking entre contenedores
- Ambos `docker-compose.yml` (frontend y backend) declaran la red externa **`scorpio-net`**, compartida entre el contenedor nginx del frontend y el `api` del backend, para que nginx pueda resolver `api:3000` por DNS interno de Docker.
- `scorpio-backend/docker-compose.yml`: la red `scorpio-net` se definió sin `external: true`, para que el propio stack de backend la cree si no existe (el frontend la referencia como `external: true`, ya que no es su dueño).
- El puerto 3000 del backend (`ports: '127.0.0.1:3000:3000'`) queda atado solo a loopback del host, únicamente para debug local — no es necesario (ni deseable) exponerlo más ampliamente: todo el tráfico real llega vía CloudFront → nginx → `scorpio-net` → `api:3000`.

### Pendientes conocidos
- **Redeploy real**: recrear el contenedor de frontend (`docker compose up -d`) para que tome la imagen/env actualizados; actualmente sigue corriendo una imagen de hace 2 semanas.
- **Creación de `scorpio-net`**: la red aún no existe en el host (`docker network ls` no la lista); la crea el stack de backend al levantarse.
- **Segmentación de red pendiente de corregir en `scorpio-backend`**: en la última edición del compose de backend, `db` quedó también en `scorpio-net` (compartida con el frontend) en vez de solo en `internal`, y `api` perdió su membresía en `internal`. Hay que volver a dejar a `db` únicamente en `internal` y a `api` en ambas redes (`internal` + `scorpio-net`), para que el contenedor del frontend no tenga alcance de red hacia Postgres.
- **`ORIGIN_SECRET` sin valor real**: el chequeo de origen CloudFront está deshabilitado hasta que se configure el secreto real en `.env` y en el custom origin header de la distribución CloudFront.
