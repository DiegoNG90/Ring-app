import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

/** Carga .env.local y .env sin sobreescribir variables ya presentes (p. ej. Railway). */
export function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const filePath = path.join(projectRoot, name);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;

      const key = trimmed.slice(0, eq).trim();
      const rawValue = trimmed.slice(eq + 1).trim();
      const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}
