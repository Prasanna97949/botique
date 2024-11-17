import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import pg from "pg";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'store',
    password: 'mani',
    port: 5433,
});
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products");
        res.render("index.ejs", { products: result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});

app.get("/collection", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products");
        const d = result.rows[0];
        console.log(d);
        res.render("collection.ejs", { products:result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.post("/collection/filter", (req, res) => {
    const { price, category } = req.body;
    console.log(price);
    console.log(category);
    res.redirect("/collection");
});

app.get("/admin", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products");
        res.render("admin.ejs", { products: result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
        res.render("edit.ejs", { product: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});

app.post("/add", upload.fields([{ name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' }]), async (req, res) => {
    const { name, price, description, category } = req.body;
    const image_1 = req.files['image_1'] ? req.files['image_1'][0].filename : null;
    const image_2 = req.files['image_2'] ? req.files['image_2'][0].filename : null;
    const image_3 = req.files['image_3'] ? req.files['image_3'][0].filename : null;

    try {
        await db.query(
            "INSERT INTO products (product_name, price, description, category, image_1, image_2, image_3) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [name, price, description, category, image_1, image_2, image_3]
        );
        res.redirect("/admin");
    } catch (error) {
        console.log(error);
    }
});
app.get("/edit/:id",async(req,res)=>{
    const { id } = req.params;
    const result =await db.query("select * from products where id = $1",[id]);
    res.render("edit.ejs",({product:result.rows[0]}));
})

app.post("/edit/:id", upload.fields([{ name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' }]), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category } = req.body;
    const image_1 = req.files && req.files['image_1'] ? req.files['image_1'][0].filename : req.body.existingImage1;
    const image_2 = req.files && req.files['image_2'] ? req.files['image_2'][0].filename : req.body.existingImage2;
    const image_3 = req.files && req.files['image_3'] ? req.files['image_3'][0].filename : req.body.existingImage3;

    try {
        await db.query(
            "UPDATE products SET product_name = $1, price = $2, description = $3, category = $4, image_1 = $5, image_2 = $6, image_3 = $7 WHERE id = $8",
            [name, price, description, category, image_1, image_2, image_3, id]
        );
        res.redirect("/admin");
    } catch (error) {
        console.log(error);
    }
});
app.get("/delete-image/:id/:imageColumn", async (req, res) => 
    {
         const { id, imageColumn } = req.params; 
try
 { 
    const result = await db.query(`SELECT ${imageColumn} FROM products WHERE id = $1`, [id]);
     const imageName = result.rows[0][imageColumn]; 
     if (imageName) 
        { 
            fs.unlinkSync(path.join(__dirname, 'public/uploads', imageName));

         } 
         await db.query(`UPDATE products SET ${imageColumn} = NULL WHERE id = $1`, [id]); 
         res.redirect(`/edit/${id}`); 
        } 
        catch (err) { console.error(err); res.send("Error: " + err); }});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
