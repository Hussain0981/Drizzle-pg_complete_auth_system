import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { initSuperAdmin } from './utils/initAmin'
import expressLayouts from 'express-ejs-layouts';

// web routes import 
import webAdminRoute from './router/web/adminRoute'
import webDashboardRoute from './router/web/dashboardRoute'

// api routes import 
import apiAdminRoute from './router/api/adminLoginRoute'


const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// solve MIME error css
app.get('public/css/output.css', (req, res) => {
    res.type('text/css');
    res.sendFile(join(__dirname, "public/css/output.css"));
})

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/index');
// global middleware
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});
// routes middlewares
// web
app.use('/admin/login', webAdminRoute)
app.use('/dashboard', webDashboardRoute)
// api
app.use('/api/v1/admin', apiAdminRoute)

// ============= START SERVER =============

app.listen(PORT, async () => {
    await initSuperAdmin()
    console.log(` Server is running on http://localhost:${PORT}`);
});

export default app;