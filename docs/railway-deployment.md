# Deploy en Railway

Guía para publicar **ring-training-app** (Next.js + better-sqlite3 + Lucia) en un solo servicio con base de datos persistente.

## Requisitos

- Cuenta en [Railway](https://railway.com)
- Repo en GitHub (o GitLab) con este proyecto
- [Railway CLI](https://docs.railway.com/develop/cli) (opcional, para deploy desde terminal)

## 1. Crear el proyecto en Railway

1. Entrá a [railway.com/new](https://railway.com/new).
2. Elegí **Deploy from GitHub repo** y conectá el repositorio de esta app.
3. Railway detectará Next.js vía Nixpacks y usará [`railway.toml`](../railway.toml).

## 2. Crear volumen persistente para SQLite

La base `training.db` debe vivir en un volumen; sin esto, cada deploy borraría los datos.

1. Abrí el servicio de la app en Railway.
2. Andá a **Settings** → **Volumes**.
3. Clic en **Add Volume**.
4. Configurá:
   - **Mount path:** `/data`
5. Guardá y redeployá el servicio.

Railway montará `/data` dentro del contenedor. La app escribe la DB en `/data/training.db` cuando `DB_PATH` está configurado.

## 3. Variables de entorno

En **Variables** del servicio, agregá:

| Variable   | Valor                 | Notas                                      |
|------------|-----------------------|--------------------------------------------|
| `DB_PATH`  | `/data/training.db`   | Ruta absoluta dentro del volumen montado   |
| `NODE_ENV` | `production`          | Cookies de sesión seguras (Lucia)          |

### Credenciales de seed (3 usuarios)

Definí estas variables en Railway **antes** de ejecutar el seed. Las contraseñas **no van en el repo**.

| Variable | Ejemplo de valor |
|----------|------------------|
| `SEED_USER_1_EMAIL` | `diego@test.com` |
| `SEED_USER_1_PASSWORD` | *(contraseña real)* |
| `SEED_USER_2_EMAIL` | `profe` |
| `SEED_USER_2_PASSWORD` | *(contraseña real)* |
| `SEED_USER_3_EMAIL` | `alumno` |
| `SEED_USER_3_PASSWORD` | *(contraseña real)* |

**Cómo cargarlas en Railway:**

1. Abrí tu servicio en [railway.com](https://railway.com).
2. Pestaña **Variables** → **New Variable** (o **Raw Editor** para pegar varias).
3. Agregá cada par `SEED_USER_N_EMAIL` / `SEED_USER_N_PASSWORD` con los valores reales.
4. Guardá. Railway redeployará automáticamente (el seed no corre solo; lo ejecutás vos en el paso 4).

Para desarrollo local, copiá `.env.example` a `.env.local` y completá las contraseñas ahí (`.env.local` está gitignored).

`PORT` lo define Railway automáticamente; no hace falta setearlo.

**No setear `AUTH_DEBUG` en producción.**

## 4. Primer deploy

Tras conectar el repo y configurar volumen + variables:

1. Railway hará build con `pnpm install && pnpm build`.
2. Al arrancar, `src/lib/db.ts` crea las tablas si no existen (`CREATE TABLE IF NOT EXISTS`).
3. Generá dominio público (Settings → **Networking** → **Generate Domain**).
4. Ejecutá el seed de usuarios autorizados (Railway inyecta las variables del servicio):

```bash
railway link
railway ssh -- node scripts/db-status.mjs
railway ssh -- node scripts/seed-users.mjs
```

Los seeds deben correr **dentro** del contenedor (`railway ssh`), no con `railway run` (ese comando corre en tu PC y no escribe en el volumen `/data`).

### Seed de trainings (después de usuarios)

```bash
railway ssh -- node scripts/run-sql-file.mjs src/mocks/DB_SEED_trainings.sqlite.sql
```

Si corriste el seed de trainings con el email equivocado, limpiá huérfanos y volvé a ejecutar:

```bash
railway ssh -- node scripts/cleanup-orphan-trainings.mjs
railway ssh -- node scripts/run-sql-file.mjs src/mocks/DB_SEED_trainings.sqlite.sql
```

### Usuarios habilitados

El MVP tiene exactamente 3 cuentas. Los **logins** son los valores de `SEED_USER_N_EMAIL`; las **contraseñas** viven solo en las variables de Railway (o en tu `.env.local` local).

| Usuario | Variable de login |
|---------|-------------------|
| Diego | `SEED_USER_1_EMAIL` → `diego@test.com` |
| Profe | `SEED_USER_2_EMAIL` → `profe` |
| Alumno | `SEED_USER_3_EMAIL` → `alumno` |

Compartí cada contraseña por canal seguro a cada usuario. No documentar contraseñas en el repo.

No hay sign-up público; el registro web está deshabilitado.

## 5. Deploy con CLI (alternativa)

```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

## 6. Verificación

- [ ] La app responde en la URL pública (`/`).
- [ ] Login funciona con los 3 usuarios seedeados.
- [ ] Crear/editar rutinas persiste tras un redeploy (prueba clave del volumen).
- [ ] Cookies de sesión funcionan en HTTPS (Railway provee SSL).
- [ ] `/training` sin sesión redirige a `/`.
- [ ] PWA instalable en Android/iOS (ver abajo).

## 7. Instalar como PWA

**Android (Chrome):** Menú → "Instalar app" o "Agregar a pantalla de inicio".

**iOS (Safari):** Compartir → "Agregar a pantalla de inicio".

La app abre en pantalla completa; los datos siguen viniendo del servidor (requiere conexión).

## Notas técnicas

- **Vercel no es compatible** con `better-sqlite3` + archivo local (filesystem efímero).
- El schema se aplica al importar `src/lib/db.ts`; no hace falta `pnpm db:init` en producción.
- Scripts en `scripts/` respetan `DB_PATH` vía `getDbPath()` en `db-utils.mjs`.
- Plan **Hobby (~USD 5/mes)** evita sleep por inactividad del free tier.
- Local: `pnpm db:init && pnpm db:seed-users`

## Troubleshooting

| Problema | Causa probable | Solución |
|----------|----------------|----------|
| DB vacía tras redeploy | Sin volumen o `DB_PATH` incorrecto | Montar volumen en `/data` y setear `DB_PATH=/data/training.db` |
| Error al compilar `better-sqlite3` | Build sin dependencias nativas | Nixpacks + `pnpm.onlyBuiltDependencies` en `package.json` |
| Login falla en prod | Cookie no segura / usuario inexistente / vars de seed faltantes | `NODE_ENV=production`, variables `SEED_USER_*` en Railway, y ejecutar `seed-users.mjs` |
| App duerme | Free tier | Upgrade a Hobby o aceptar cold start |
