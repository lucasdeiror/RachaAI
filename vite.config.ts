/// <reference types="vitest" />
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const aqui = (arquivo: string) => decodeURIComponent(new URL(arquivo, import.meta.url).pathname);

/**
 * Gera dist/sw.js a partir de sw.js com a lista de arquivos deste build (nomes com hash)
 * e uma versão que muda quando qualquer arquivo muda (padrão Gabi Modas).
 */
function serviceWorker(): Plugin {
  return {
    name: 'rachaai-service-worker',
    apply: 'build',
    writeBundle(saida, pacote) {
      const publicDir = join(aqui('.'), 'public');
      const publicos = readdirSync(publicDir);
      const arquivos = [
        '/',
        ...Object.keys(pacote).filter((a) => a !== 'index.html' && !a.endsWith('.map')),
        ...publicos,
      ].map((a) => (a.startsWith('/') ? a : '/' + a));

      const hash = createHash('sha256');
      for (const f of Object.values(pacote)) {
        hash.update(f.type === 'chunk' ? f.code : f.source);
      }
      for (const p of publicos) {
        hash.update(readFileSync(join(publicDir, p)));
      }

      const sw = readFileSync(join(aqui('.'), 'sw.js'), 'utf8')
        .replace('__VERSAO__', hash.digest('hex').slice(0, 12))
        .replace('__ARQUIVOS__', JSON.stringify(arquivos));

      writeFileSync(join(saida.dir!, 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  plugins: [react(), serviceWorker()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
