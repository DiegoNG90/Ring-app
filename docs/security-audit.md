# Auditoría de seguridad

Checklist para ejecutar **después del deploy en Railway** (URL HTTPS real).

## Automatizado (local o CI)

```bash
pnpm audit
```

Herramientas externas (requieren URL de producción):

| Herramienta | URL | Qué valida |
|-------------|-----|------------|
| Mozilla Observatory | https://observatory.mozilla.org/ | Headers HTTP |
| securityheaders.com | https://securityheaders.com/ | Headers HTTP |
| OWASP ZAP | Baseline scan contra la URL | XSS, cookies, info disclosure |
| Lighthouse | Chrome DevTools → Lighthouse → Security/PWA | HTTPS, mixed content, installable |

## Checklist manual

### Autenticación

- [ ] `/training` sin sesión → redirige a `/`
- [ ] `/?mode=signup` → solo muestra login (sin registro)
- [ ] No existe server action de signUp
- [ ] Login con usuario no seedeado → falla
- [ ] Logout invalida sesión server-side
- [ ] 10+ intentos fallidos de login → rate limit activo

### Cookies y sesión

- [ ] Cookie de sesión: `HttpOnly`, `Secure` (en prod), `SameSite`
- [ ] Sesión persiste tras refresh
- [ ] Sesión no accesible desde JavaScript (`document.cookie`)

### Headers HTTP

- [ ] `Strict-Transport-Security` presente en prod
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Content-Security-Policy` configurado
- [ ] `Referrer-Policy` configurado

### Datos y exposición

- [ ] `training.db` no accesible vía HTTP
- [ ] `AUTH_DEBUG` no seteado en producción
- [ ] No hay endpoints de debug expuestos
- [ ] Errores de servidor no filtran stack traces al cliente

### Dependencias

- [ ] `pnpm audit` sin vulnerabilidades high/critical abiertas

## Resultado inicial (pre-deploy, local)

| Herramienta | Resultado |
|-------------|-----------|
| `pnpm audit --audit-level high` | **0 high/critical** (Next.js actualizado a 15.5.18). Quedan 2 moderate en dependencias transitivas. |
| Tests | 109/109 passing |
| Build local (Windows) | Compila OK; `output: standalone` puede fallar por permisos de symlinks en Windows. En Railway (Linux) no aplica. |

### OWASP ZAP / headers scan

Ejecutar manualmente contra la URL HTTPS de Railway post-deploy (ver checklist arriba).

## Registro de hallazgos

| ID | Severidad | Descripción | Estado | Notas |
|----|-----------|-------------|--------|-------|
| | critical / high / medium / low | | fixed / open / wontfix | |

**Criterio de cierre:** cero hallazgos critical/high abiertos.

## Remediaciones ya implementadas en código

- Sign-up público eliminado
- Usuarios fijos vía `scripts/seed-users.mjs` (credenciales en variables de entorno, no en el repo)
- Middleware protege `/training/*`
- Rate limiting en login (10 intentos / 15 min por IP)
- Security headers en `next.config.ts`
- `AUTH_DEBUG` no loguea contraseñas; solo activo fuera de producción
