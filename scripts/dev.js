import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Some Windows shell environments (e.g. sessions rooted in Git Bash) inherit
// a PATH stripped of System32, which breaks child_process's ability to
// resolve cmd.exe -- and npm/nodemon/vite all resolve to .cmd shims on
// Windows that require it. Restore it before spawning anything.
if (process.platform === 'win32') {
  const sysRoot = process.env.SystemRoot || 'C:\\Windows';
  const system32 = join(sysRoot, 'System32');
  if (!process.env.PATH.toLowerCase().includes(system32.toLowerCase())) {
    process.env.PATH = `${process.env.PATH};${system32};${sysRoot}`;
  }
}

const concurrentlyBin = join(__dirname, '..', 'node_modules', 'concurrently', 'dist', 'bin', 'concurrently.js');

const child = spawn(
  process.execPath,
  [concurrentlyBin, '-k', '-n', 'API,WEB', '-c', 'yellow,cyan', 'npm:dev:server', 'npm:dev:client'],
  { stdio: 'inherit', env: process.env }
);

child.on('exit', (code) => process.exit(code ?? 0));
