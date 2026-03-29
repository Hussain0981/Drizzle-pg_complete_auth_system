import express, { urlencoded } from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: true }))

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// EJS setup — views inside src
app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

// Static files — public outside src
app.use(express.static(join(__dirname, "..", "public")));


// views routes
import userWeb from './router/web'
app.use('/', userWeb)

// apis
import userApi from './router/api'
app.use('/', userApi)


app.listen(3000, () => console.log("Server running on port 3000"));
