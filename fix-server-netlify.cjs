const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "if (process.env.NETLIFY) return;",
  "if (process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT) return;"
);

fs.writeFileSync('server.ts', code);
