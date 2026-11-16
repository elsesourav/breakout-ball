import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (/\.(ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allSrcFiles = getAllFiles(srcDir);
console.log(`Auditing ${allSrcFiles.length} TypeScript source files in src/...`);

const importRegex = /(?:import|export)\s+(?:(?:(?:\*\s+as\s+\w+)|(?:\{[^}]*\}compat?)|(?:[\w\s,{}*]+))\s+from\s+)?['"]([^'"]+)['"]/g;
const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

const brokenImports = [];
const shimUsage = [];
const allImportsMap = new Map(); // file -> [imported targets]

for (const filePath of allSrcFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dir = path.dirname(filePath);
  const relativeFromSrc = path.relative(srcDir, filePath);

  const targets = [];

  const checkSpecifier = (specifier) => {
    // Only check local relative or src-based imports
    if (specifier.startsWith('.')) {
      let resolved = path.resolve(dir, specifier);
      let found = false;

      // Check direct or with extensions
      if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        found = true;
      } else {
        for (const ext of extensions) {
          if (fs.existsSync(resolved + ext) && fs.statSync(resolved + ext).isFile()) {
            resolved = resolved + ext;
            found = true;
            break;
          }
        }
        if (!found) {
          // Check index file in directory
          for (const ext of extensions) {
            const indexFile = path.join(resolved, `index${ext}`);
            if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
              resolved = indexFile;
              found = true;
              break;
            }
          }
        }
      }

      if (!found) {
        brokenImports.push({ file: relativeFromSrc, specifier, reason: 'File does not exist' });
      } else {
        targets.push(resolved);
        // Check if importing from bridge shims
        const resolvedRel = path.relative(srcDir, resolved);
        if (
          resolvedRel.startsWith('components/') &&
          !resolvedRel.includes('/', 'components/'.length) &&
          !resolvedRel.endsWith('index.ts')
        ) {
          // It's a file directly under src/components/ e.g. src/components/LevelMap.tsx
          shimUsage.push({ file: relativeFromSrc, specifier, resolvedRel });
        }
        if (resolvedRel === 'utils/audio.ts' || resolvedRel === 'utils/synthAudio.ts') {
          shimUsage.push({ file: relativeFromSrc, specifier, resolvedRel });
        }
      }
    }
  };

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    checkSpecifier(match[1]);
  }
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    checkSpecifier(match[1]);
  }

  allImportsMap.set(filePath, targets);
}

console.log('\n--- AUDIT RESULTS ---');
console.log(`1. Broken Imports Count: ${brokenImports.length}`);
if (brokenImports.length > 0) {
  console.log(JSON.stringify(brokenImports, null, 2));
}

console.log(`2. Bridge Shim Usages Count: ${shimUsage.length}`);
if (shimUsage.length > 0) {
  console.log(JSON.stringify(shimUsage, null, 2));
}

// 3. Cycle Detection
const cycles = [];
function detectCycles(current, visited = new Set(), stack = []) {
  visited.add(current);
  stack.push(current);

  const neighbors = allImportsMap.get(current) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      detectCycles(neighbor, visited, stack);
    } else if (stack.includes(neighbor)) {
      const cyclePath = stack.slice(stack.indexOf(neighbor)).concat(neighbor).map(p => path.relative(srcDir, p));
      cycles.push(cyclePath);
    }
  }

  stack.pop();
}

for (const filePath of allSrcFiles) {
  detectCycles(filePath, new Set(), []);
}

console.log(`3. Circular Dependency Chains Count: ${cycles.length}`);
if (cycles.length > 0) {
  console.log('Sample Cycles (up to 5):', cycles.slice(0, 5));
}
