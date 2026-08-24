const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "app.put('/api/patient/profile', requireAuth, async (req, res) => {",
  "app.put('/api/patient/profile', requireAuth, async (req: AuthRequest, res) => {"
);

fs.writeFileSync('server.ts', code);
