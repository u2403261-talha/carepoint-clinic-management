const fs = require('fs');
let code = fs.readFileSync('src/api/doctorRoutes.ts', 'utf8');

code = code.replace(
  "router.get('/profile', requireAuth, async (req, res) => {",
  "router.get('/profile', requireAuth, async (req: AuthRequest, res) => {"
);
code = code.replace(
  "router.put('/profile', requireAuth, async (req, res) => {",
  "router.put('/profile', requireAuth, async (req: AuthRequest, res) => {"
);

fs.writeFileSync('src/api/doctorRoutes.ts', code);
