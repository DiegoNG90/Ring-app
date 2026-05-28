# Compartir la app con usuarios

Instrucciones para entregar el MVP a los 3 usuarios autorizados.

Scripts y seeds: [scripts.md](./scripts.md)

## Antes de compartir

- [ ] Deploy en Railway completado y verificado
- [ ] Seed de usuarios y rutinas ejecutado (`railway ssh -- node scripts/seed-all.mjs`)
- [ ] Auditoría de seguridad completada (ver [security-audit.md](./security-audit.md))
- [ ] PWA probada en al menos un dispositivo Android y uno iOS

## Usuarios habilitados

| Usuario | Login |
|---------|-------|
| Diego | `diego@test.com` |
| Profe | `profe` |
| Alumno | `alumno` |

Enviar la contraseña de cada uno por canal seguro (WhatsApp, Signal, en persona). **No enviar credenciales por email junto con la URL de la app.**

## Qué compartir

1. **URL de la app** (dominio Railway con HTTPS)
2. **Usuario y contraseña** (canal separado y seguro)
3. **Cómo instalar en el celular:**
   - **Android:** Abrí la URL en Chrome → menú (⋮) → "Instalar app" o "Agregar a pantalla de inicio"
   - **iOS:** Abrí la URL en Safari → Compartir → "Agregar a pantalla de inicio"

## Notas para usuarios

- La app necesita conexión a internet para funcionar (no es offline).
- Cada usuario ve solo sus propias rutinas.
- No hay opción de crear cuenta; si olvidan la contraseña, resetear con `scripts/reset-dev-password.mjs` (ver [scripts.md](./scripts.md)).

## Monitoreo post-lanzamiento

Revisar logs de Railway las primeras 48 horas por:

- Intentos de login fallidos repetidos
- Errores 500 inesperados
- Cold starts prolongados (free tier)
