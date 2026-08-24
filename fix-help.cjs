const fs = require('fs');
let code = fs.readFileSync('src/components/HelpSupportPage.tsx', 'utf8');

if (!code.includes('/// <reference types="vite/client" />')) {
  code = '/// <reference types="vite/client" />\n' + code;
  fs.writeFileSync('src/components/HelpSupportPage.tsx', code);
}
