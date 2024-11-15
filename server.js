import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get("/",(req,res)=>{
    res.render("index.ejs");
});
app.get("/collection",(req,res)=>{
});
app.get("/about",(req,res)=>{
});
app.get("/contact",(req,res)=>{
});


app.listen(port,()=>{
    console.log("its runing on 3000");
});