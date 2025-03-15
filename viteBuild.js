//const shell = require('shelljs');
//shell.mv('./dist/assets/*.ttf', './dist/');
//const shell = require('shelljs');
//shell.mv('./dist/assets/*.woff', './dist/');
//shell.mv('./dist/assets/*.woff2', './dist/');
/*
import pkg from 'glob';
const { glob } = pkg;
import * as fs from 'fs';
import JavaScriptObfuscator from 'javascript-obfuscator';

const obfuscate = async () => {
  const files = glob.sync('dist/assets/main.js');

  for (const file of files) {
    const code = await fs.promises.readFile(file, 'utf-8');

    const obfuscationResult = await JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        simplify: true,
    });

    const obfuscatedCode = obfuscationResult.getObfuscatedCode();
    await fs.promises.writeFile(file, obfuscatedCode, 'utf-8');
  }
};

obfuscate().catch(console.error);
*/




