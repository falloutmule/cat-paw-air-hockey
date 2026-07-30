import { fileURLToPath } from 'node:url';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const sfhsRoot = resolve(process.env.SFHS_ROOT ?? join(projectRoot, '..', 'single-file-html-software'));
const revisionFile = join(sfhsRoot, '.git');
if (!(await stat(revisionFile).then(() => true).catch(() => false))) {
  throw new Error(`SFHS_ROOT is not a Git checkout: ${sfhsRoot}`);
}
const packageJson = JSON.parse(await readFile(join(sfhsRoot, 'package.json'), 'utf8'));
if (packageJson.packageManager !== 'pnpm@11.9.0') {
  throw new Error(`Unexpected SFHS package manager: ${packageJson.packageManager}`);
}
const integrationRoot = join(sfhsRoot, 'examples', 'cat-paw-air-hockey');
await rm(integrationRoot, { recursive: true, force: true });
await mkdir(integrationRoot, { recursive: true });
await cp(projectRoot, integrationRoot, {
  recursive: true,
  filter(source) {
    const name = basename(source);
    return !['.git', '.intake', 'node_modules', 'dist', '.sfhs-integration', '.sfhs-evidence', '.sfhs-browser', '.sfhs-determinism'].includes(name);
  }
});
await writeFile(join(integrationRoot, '.sfhs-source-origin.json'), `${JSON.stringify({
  schema: 'cat-paw-air-hockey.sfhs-source-origin@1',
  sourceRoot: projectRoot,
  sfhsRoot,
  pinnedSfhsRevision: '36cf483d04b4c743b5c7f90ca8c4879d690904d1'
}, null, 2)}\n`);
console.log(JSON.stringify({ integrationRoot, sfhsRoot }, null, 2));
