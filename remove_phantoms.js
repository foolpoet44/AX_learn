const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// The phantom blocks to remove
const oldTask3 = /<!-- ════════ TASK 3 ════════ -->[\s\S]*?(?=<!-- ════════ TASK 03 ════════ -->)/;
const oldTask5 = /<!-- ════════ TASK 5 ════════ -->[\s\S]*?(?=<!-- ════════ TASK 04 ════════ -->)/;

content = content.replace(oldTask3, '');
content = content.replace(oldTask5, '');

fs.writeFileSync(htmlPath, content, 'utf8');
console.log("Phantom sections safely removed!");
