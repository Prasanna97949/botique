import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import pg from "pg";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    user: 'postgres',
    host: 'localhost',
    database: 'world',
    password: 'mani',
    port: 5433,
});

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

app.get("/",(req,res)=>{
    res.render("index.ejs");
});
app.get("/collection",async(req,res)=>{
    try {
        const result = await db.query("SELECT * FROM products");
        
        res.render("collection.ejs", { products: result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
    
});
app.get("/about",(req,res)=>{
});
app.get("/contact",(req,res)=>{
});


app.listen(port,()=>{
    console.log("its runing on 3000");
});