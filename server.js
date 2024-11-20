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
        const slider = await db.query("SELECT * FROM slider");
        const front = await db.query("select * from front order by id asc");
        res.render("index.ejs", { slider: slider.rows[0] ,image1:front.rows[0],image2:front.rows[1],image3:front.rows[2],image4:front.rows[3]});
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});

app.get("/collection", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY id ASC");
        const d = result.rows[0];
        console.log(d);
        res.render("collection.ejs", { products:result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});
app.get("/product/:id",async(req,res)=>{
    const {id }= req.params;
    const result = await db.query("select * from products where id = $1",[id]);
console.log(result.rows[0]);
    res.render("product.ejs",({products:result.rows[0]}));
})

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});
app.get("/cart",(req,res)=>{
    res.render("cart.ejs");
})

app.post("/collection/filter", async (req, res) => {
    const { price, category } = req.body;

    try {
        if(price === "ASC") {
            if(category) {
                if(Array.isArray(category)){
                    console.log("multiple", price, category);
                    const result = await db.query("SELECT * FROM products WHERE category = ANY($1) ORDER BY price ASC", [category]);
                   res.render("filter.ejs", { products: result.rows });
                
                } else {
                    const result = await db.query("SELECT * FROM products WHERE category = $1 ORDER BY price ASC", [category]);
                     res.render("filter.ejs", { products: result.rows });
                    
                }
            } else {
                const result = await db.query("SELECT * FROM products ORDER BY price ASC");
                res.render("filter.ejs", { products: result.rows });
            }
        } else {
            if(category) {
                if(Array.isArray(category)){
                    console.log("desc multi", price, category);
                    const result = await db.query("SELECT * FROM products WHERE category = ANY($1) ORDER BY price DESC", [category]);
                    res.render("filter.ejs", { products: result.rows });
                } else {
                    const result = await db.query("SELECT * FROM products WHERE category = $1 ORDER BY price DESC", [category]);
                    res.render("filter.ejs", { products: result.rows });
                }
            } else {
                const result = await db.query("SELECT * FROM products ORDER BY price DESC");
                res.render("filter.ejs", { products: result.rows });
            }
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.send('An error occurred while fetching the products.');
    }
});


app.get("/admin", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY id ASC");
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

app.post("/add", upload.fields([{ name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' },{name: 'image_4'}]), async (req, res) => {
    const { name, price, description, category ,price_2,offer } = req.body;
    const image_1 = req.files['image_1'] ? req.files['image_1'][0].filename : null;
    const image_2 = req.files['image_2'] ? req.files['image_2'][0].filename : null;
    const image_3 = req.files['image_3'] ? req.files['image_3'][0].filename : null;
    const image_4 = req.files['image_3'] ? req.files['image_3'][0].filename : null;

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


app.post("/edit/:id", upload.fields([{ name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' }]), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, price_2, offer } = req.body;
    const image_1 = req.files && req.files['image_1'] ? req.files['image_1'][0].filename : req.body.existingImage1;
    const image_2 = req.files && req.files['image_2'] ? req.files['image_2'][0].filename : req.body.existingImage2;
    const image_3 = req.files && req.files['image_3'] ? req.files['image_3'][0].filename : req.body.existingImage3;
    

    try {
        await db.query(
            "UPDATE products SET name = $1, price = $2, description = $3, category = $4, image_1 = $5, image_2 = $6, image_3 = $7 , price_2=$8 ,offer =$9 WHERE id = $10",
            [name, price, description, category, image_1, image_2, image_3,price_2,offer,id]
        );
        res.redirect("/admin");
    } catch (error) {
        console.log(error);
    }
});
app.get("/delete-image/:id/:imageColumn/:t_n", async (req, res) => 
    {
         const { id, imageColumn,t_n } = req.params; 
        
         
try
 { 
    
    const result = await db.query(`SELECT ${imageColumn} FROM ${t_n} WHERE id = $1`, [id]);
     const imageName = result.rows[0][imageColumn]; 
     if (imageName) 
        { 
            fs.unlinkSync(path.join(__dirname, 'public/uploads', imageName));

         } 
         await db.query(`UPDATE ${t_n} SET ${imageColumn} = NULL WHERE id = $1`, [id]); 
         if(t_n === "slider" || t_n === "front"){
            res.redirect("/forntedit");
         }
         else {
         res.redirect(`/edit/${id}`); 
         }
        } 
        catch (err) { console.error(err); res.send("Error: " + err); }});

app.get("/forntedit",async(req,res)=>{
     const result = await db.query("select * from slider ")
     const front = await db.query("select * from front order by id asc")
    res.render("forntedit.ejs",({slider:result.rows[0],first:front.rows}));
});

app.post("/slider",upload.fields([{ name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' },{name:'image_4'}]),async(req,res)=>{
    const image_1 = req.files && req.files['image_1'] ? req.files['image_1'][0].filename : req.body.existingImage1;
    const image_2 = req.files && req.files['image_2'] ? req.files['image_2'][0].filename : req.body.existingImage2;
    const image_3 = req.files && req.files['image_3'] ? req.files['image_3'][0].filename : req.body.existingImage3;
    const image_4 = req.files && req.files['image_4'] ? req.files['image_4'][0].filename : req.body.existingImage4;

    try {
        
            await db.query(
                "UPDATE slider SET image_1 = $1, image_2 = $2, image_3 = $3 , image_4 =$4 where id = 1",
                [image_1, image_2, image_3,image_4]
            );
            res.redirect("/forntedit");
        
    } catch (error) {
        console.log(error);
    }
    
});
app.post("/front",upload.fields([{name:'image'}]),async(req,res)=>{
    const image = req.files && req.files['image'] ? req.files['image'][0].filename : req.body.existingImage1;
    
    const{title,short_note,id}=req.body;

    try {
        
        await db.query(
            "UPDATE front SET image = $1,titel = $2, short_notes =$3,t_n =$4  where id =$5 ",
            [image,title,short_note,"front",id]
        );
        res.redirect("/forntedit");
    
} catch (error) {
    console.log(error);
}
   
    
})



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
