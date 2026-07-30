import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sfhsRoot = resolve(process.env.SFHS_ROOT ?? join(projectRoot, '..', 'single-file-html-software'));
const integrationProject = join(sfhsRoot, 'examples', 'cat-paw-air-hockey');
const args = process.argv.slice(2);
if (args.length === 0) throw new Error('Provide an SFHS command.');
const command = ['sfhs', ...args, '--project', integrationProject, '--json'];
const result = spawnSync('pnpm', command, { cwd: sfhsRoot, stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
