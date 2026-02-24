const fs = require('fs');
const path = require('path');
const { transformFileSync } = require(path.resolve(process.env.APPDATA, 'npm/node_modules/@babel/core'));

const fullPath = path.resolve('vite.config.ts');
const result = transformFileSync(fullPath, {
    presets: [
        [path.resolve(process.env.APPDATA, 'npm/node_modules/@babel/preset-typescript'), { allExtensions: true }]
    ],
    retainLines: true,
});

fs.writeFileSync('vite.config.js', result.code);
fs.unlinkSync(fullPath);
console.log('Converted vite.config.ts to vite.config.js');
