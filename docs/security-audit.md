# Auditoría de seguridad — Runbook

Guía paso a paso para validar la app **después del deploy en Railway**, antes de compartirla con usuarios.

> Railway no ejecuta esta auditoría automáticamente. Es una verificación manual y semiautomática que vos corrés contra la URL HTTPS real de producción.

---

## Cuándo ejecutarla

**Después** de completar:

1. Deploy exitoso en Railway
2. Volumen montado en `/data` + `DB_PATH=/data/training.db`
3. Variables `SEED_USER_*` cargadas en Railway
4. `railway ssh -- node scripts/seed-all.mjs` ejecutado
5. Login probado al menos una vez en la URL pública

Documentación de scripts: [scripts.md](./scripts.md)

**Antes** de compartir la URL con los 3 usuarios (ver [share-with-users.md](./share-with-users.md)).

---

## Runbook (orden recomendado)

### Paso 0 — Anotá tu URL de producción

```
PROD_URL=https://tu-app.up.railway.app
```

Usala en todos los pasos siguientes.

---

### Paso 1 — Dependencias (en tu PC)

```bash
pnpm audit --audit-level high
```

| Resultado | Acción |
|-----------|--------|
| 0 critical / 0 high | Continuar |
| Algún critical o high | **Detener.** Corregir antes de compartir la app |

---

### Paso 2 — Scans externos (pegá `PROD_URL`)

| # | Herramienta | Link | Qué mirar |
|---|-------------|------|-----------|
| 2a | securityheaders.com | https://securityheaders.com/ | Nota general; HSTS, CSP, X-Frame-Options |
| 2b | Mozilla Observatory | https://observatory.mozilla.org/ | Segunda opinión sobre headers |
| 2c | Lighthouse (Chrome) | F12 → Lighthouse → Security + PWA | HTTPS, mixed content, installable |

**Opcional (más técnico):** OWASP ZAP baseline scan apuntando a `PROD_URL`.

Anotá cualquier hallazgo en la [tabla de registro](#registro-de-hallazgos) al final.

---

### Paso 3 — Checklist manual en el browser

Usá Chrome en ventana incógnito. Reemplazá `{PROD_URL}` por tu URL real.

#### 3.1 Autenticación

| # | Prueba | Resultado esperado | ✓ |
|---|--------|-------------------|---|
| 1 | Abrí `{PROD_URL}/training` sin loguearte | Redirige a `/` | [ ] |
| 2 | Abrí `{PROD_URL}/?mode=signup` | Solo formulario de login, sin registro | [ ] |
| 3 | Login con usuario inventado (`foo` / `bar`) | Error de credenciales | [ ] |
| 4 | Login con `diego@test.com` (o profe / alumno) | Entra a `/training` | [ ] |
| 5 | Refresh en `/training` | Sesión sigue activa | [ ] |
| 6 | Logout | Vuelve a `/`; `/training` ya no deja entrar | [ ] |
| 7 | 10+ passwords incorrectas seguidas | Mensaje de rate limit | [ ] |

#### 3.2 Cookies

1. Logueate en prod
2. F12 → **Application** → **Cookies** → tu dominio
3. Verificá la cookie de sesión (`auth_session`):

| Atributo | Esperado en prod | ✓ |
|----------|------------------|---|
| HttpOnly | ✓ | [ ] |
| Secure | ✓ | [ ] |
| SameSite | Lax o Strict | [ ] |

4. En la consola del browser, ejecutá `document.cookie` → la cookie de sesión **no** debe aparecer.

#### 3.3 Datos expuestos

| # | Prueba | Resultado esperado | ✓ |
|---|--------|-------------------|---|
| 1 | Abrí `{PROD_URL}/training.db` | 404 (no descarga el archivo) | [ ] |
| 2 | Revisá variables en Railway | `AUTH_DEBUG` **no** está seteado | [ ] |

#### 3.4 Headers HTTP (alternativa a Paso 2)

En Chrome → F12 → **Network** → recargá `/` → clic en el request → **Response Headers**:

- [ ] `Strict-Transport-Security`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Content-Security-Policy`
- [ ] `Referrer-Policy`

---

### Paso 4 — Registrar hallazgos

Completá la tabla al final de este doc. Ejemplo:

| ID | Severidad | Descripción | Estado | Notas |
|----|-----------|-------------|--------|-------|
| 1 | low | CSP incluye unsafe-inline | wontfix | Requerido por Next.js |

---

### Paso 5 — Decisión de cierre

| Condición | ¿Listo para compartir? |
|-----------|------------------------|
| Login/logout OK en prod | Requerido |
| `/training` protegido sin sesión | Requerido |
| `pnpm audit` sin critical/high | Requerido |
| `training.db` no accesible por HTTP | Requerido |
| 0 hallazgos **critical/high** abiertos en la tabla | Requerido |
| Headers con nota razonable (B+ en securityheaders.com) | Recomendado para MVP |

Si todo pasa → compartí según [share-with-users.md](./share-with-users.md).

---

## Herramientas de referencia

```bash
# Dependencias (local)
pnpm audit --audit-level high
```

| Herramienta | URL | Qué valida |
|-------------|-----|------------|
| Mozilla Observatory | https://observatory.mozilla.org/ | Headers HTTP |
| securityheaders.com | https://securityheaders.com/ | Headers HTTP |
| OWASP ZAP | Baseline scan contra PROD_URL | XSS, cookies, info disclosure |
| Lighthouse | Chrome DevTools → Lighthouse | HTTPS, mixed content, PWA |

---

## Resultado inicial (pre-deploy, local)

| Herramienta | Resultado |
|-------------|-----------|
| `pnpm audit --audit-level high` | **0 high/critical** (Next.js 15.5.18). Quedan 2 moderate en dependencias transitivas. |
| Tests | 109/109 passing |
| Build local (Windows) | Compila OK; `output: standalone` puede fallar por symlinks en Windows. En Railway (Linux) no aplica. |

> Los scans de headers y OWASP ZAP **solo tienen sentido post-deploy** contra la URL HTTPS real.

---

## Registro de hallazgos

| ID | Severidad | Descripción | Estado | Notas |
|----|-----------|-------------|--------|-------|
| | critical / high / medium / low | | fixed / open / wontfix | |

**Criterio de cierre:** cero hallazgos critical/high abiertos.

---

## Remediaciones ya implementadas en código

- Sign-up público eliminado
- Usuarios vía `scripts/seed-users.mjs` (credenciales en variables de entorno, no en el repo)
- Middleware protege `/training/*`
- Rate limiting en login (10 intentos / 15 min por IP)
- Security headers en `next.config.ts`
- `AUTH_DEBUG` no loguea contraseñas; solo activo fuera de producción
