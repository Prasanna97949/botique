import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import pg from "pg";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { title } from "process";
import bcrypt from "bcrypt";
import passport, { strategies } from "passport";
import { Strategy } from "passport-local";
import session, { Cookie } from "express-session";
import GoogleStrategy from "passport-google-oauth2";
import Razorpay from 'razorpay';
import nodemailer from 'nodemailer';
import cartRoutes from './cartRoutes.js';
// server.js

env.config();

const razorpay = new Razorpay({
     key_id: "rzp_test_VozKLqA8klppsw",
      key_secret: "yg7HlRxrw3PLHwNMDkOPDhO6"
     });
let cart =[];

const app = express();
const port = 3000;

const salting_round=10;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
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
app.use(session({
    secret:"topsecret",
    saveUninitialized:true,
    resave:false,
    Cookie:{ secure: true ,
        maxAge:1000*60*60*24,
    }

}

));
app.use(passport.initialize());
app.use(passport.session());

db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});
app.use('/cart', cartRoutes);
app.get("/", async (req, res) => {
    try {
        const slider = await db.query("SELECT * FROM slider");
        const front = await db.query("select * from front order by id asc");
        res.render("index.ejs", { slider: slider.rows[0] ,image1:front.rows[0],image2:front.rows[1],image3:front.rows[2],image4:front.rows[3],
            trending1:front.rows[4],trending2:front.rows[5],trending3:front.rows[6],trending4:front.rows[7],
            trending5:front.rows[8],trending6:front.rows[9]

        });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
});

app.get("/collection", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM products ORDER BY id ASC");
        const d = result.rows[0];
        // console.log(d);
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
    // res.render("contact.ejs",({ cart }));
    res.render("contact.ejs");
});
app.get("/profile", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("profile.ejs", { user: req.user });
    } else {
        res.redirect("/login");
    }
});
app.post("/profile/update", async (req, res) => {
    if (req.isAuthenticated()) {
        const { first_name, last_name, phone, address, city, state, zip } = req.body;
        const userId = req.user.id;

        try {
            await db.query(
                "UPDATE users SET first_name = $1, last_name = $2, phone = $3, address = $4, city = $5, state = $6, zip = $7 WHERE id = $8",
                [first_name, last_name, phone, address, city, state, zip, userId]
            );
            req.user.first_name = first_name;
            req.user.last_name = last_name;
            req.user.phone = phone;
            req.user.address = address;
            req.user.city = city;
            req.user.state = state;
            req.user.zip = zip;
            res.redirect("/profile");
        } catch (err) {
            console.error(err);
            res.send("Error: " + err);
        }
    } else {
        res.redirect("/login");
    }
});
app.get('/dashboard', async (req, res) => { 
    if (req.isAuthenticated()) {
         const user = req.user; 
         try { 
            const result = await db.query(` SELECT o.order_id, o.product_name, o.quantity, o.price, o.total, o.status, o.order_date FROM orders o WHERE o.customer_id = $1 ORDER BY o.order_date DESC; `, [user.id]); 
            res.render('dashboard.ejs', { orders: result.rows, user: user }); 
        } 
        catch (error) 
        { console.error('Error fetching orders:', error); 
            res.status(500).send('Error fetching orders');
         } } 
         else
          { 
            res.redirect('/login');

          }});
app.get("/login",async(req,res)=>{
 
    if(req.isAuthenticated())
    {
    
      res.redirect("/checkout");
    }
    else{
        res.render("login.ejs");
    }
    
})
// Update quantity in the cart



app.get("/product/:id",async(req,res)=>{
    const {id }= req.params;
    const result = await db.query("select * from products where id = $1",[id]);
// console.log(result.rows[0]);
    res.render("product.ejs",({products:result.rows[0]}));
})




app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.get("/collection/:category",async(req,res)=>{
    const {category}=req.params;

    // console.log(category);
    const result = await db.query(`SELECT * FROM products WHERE category = '${category}' ORDER BY price ASC`);
    if(result.rows.length === 0){
       var cat = category;
    }
    res.render("filter.ejs", { products: result.rows ,filter:category,tem:cat});})

app.post("/collection/filter", async (req, res) => {
    const { price, category } = req.body;
    const t = "t";
// console.log(category,"test");
    try {
        if(price === "ASC") {
            if(category) {
                if(Array.isArray(category)){
                    
                    const result = await db.query("SELECT * FROM products WHERE category = ANY($1) ORDER BY price ASC", [category]);
                    
                   res.render("filter.ejs", { products: result.rows,filter:category});
                
                } else {
                    const result = await db.query("SELECT * FROM products WHERE category = $1 ORDER BY price ASC", [category]);
                    if(result.rows.length === 0){
                        var cat = category;
                     }
                     res.render("filter.ejs", { products: result.rows,filter:category,tem:cat});
                    
                }
            } else {
                const result = await db.query("SELECT * FROM products ORDER BY price ASC");
                res.render("filter.ejs", { products: result.rows ,filter:category});
            }
        } else if(price === "DESC") {
            if(category) {
                if(Array.isArray(category)){
                   
                    const result = await db.query("SELECT * FROM products WHERE category = ANY($1) ORDER BY price DESC", [category]);
                    res.render("filter.ejs", { products: result.rows,filter:category,checked:"desc"});
                } else {
                    const result = await db.query("SELECT * FROM products WHERE category = $1 ORDER BY price DESC", [category]);
                    if(result.rows.length === 0){
                        var cat = category;
                     }
                    res.render("filter.ejs", { products: result.rows ,filter:category,checked:"desc",tem:cat});
                }
            } else {
                const result = await db.query("SELECT * FROM products ORDER BY price DESC");
                res.render("filter.ejs", { products: result.rows ,filter:category,checked:"desc"});
            }
        }
        else{
            try {
                const result = await db.query("");
            } catch (error) {
                console.error('Database query error:', error);
                res.send('An error occurred while fetching the products.');
            }
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.send('An error occurred while fetching the products.');
    }
});


app.get("/admin", async (req, res) => {
    if(req.isAuthenticated() && req.user.first_name === "admin"){
        res.render("adminhome.ejs");
    }
    else{
        res.redirect("/login");
    }
});
app.get("/homepage",async(req,res)=>{
   if(req.isAuthenticated() && req.user.first_name === "admin"){ 
    const result = await db.query("select * from slider ")
    const front = await db.query("select * from front order by id asc")
    res.render("homepage.ejs",({slider:result.rows[0],first:front.rows}));
    }
});
app.get("/addproduct",async(req,res)=>{
    if(req.isAuthenticated() && req.user.first_name === "admin"){
    try {
        const result = await db.query("SELECT * FROM products ORDER BY id ASC");
        res.render("addproduct.ejs", { products: result.rows });
    } catch (err) {
        console.error(err);
        res.send("Error: " + err);
    }
}
});

app.get("/edit/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query("SELECT * FROM products WHERE id = $1", [id]);
        res.render("editproduct.ejs", { product: result.rows[0] });
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
    const image_4 = req.files['image_4'] ? req.files['image_4'][0].filename : null;

    try {
        await db.query(
            "INSERT INTO products (name, price, description, category, image_1, image_2, image_3,price_2,offer,t_n,image_4) VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10,$11)",
            [name, price, description, category, image_1, image_2, image_3,price_2,offer,"products",image_4]
        );
        res.redirect("/addproduct");
    } catch (error) {
        console.log(error);
    }
});


app.post("/edit/:id", upload.fields([{ name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' }, {name:'image_4'}]), async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, price_2, offer } = req.body;
    const image_1 = req.files && req.files['image_1'] ? req.files['image_1'][0].filename : req.body.existingImage1;
    const image_2 = req.files && req.files['image_2'] ? req.files['image_2'][0].filename : req.body.existingImage2;
    const image_3 = req.files && req.files['image_3'] ? req.files['image_3'][0].filename : req.body.existingImage3;
    const image_4 = req.files && req.files['image_4'] ? req.files['image_4'][0].filename : req.body.existingImage4;

    

    try {
        await db.query(
            "UPDATE products SET name = $1, price = $2, description = $3, category = $4, image_1 = $5, image_2 = $6, image_3 = $7 , price_2 = $8 ,offer = $9,image_4 = $10 WHERE id = $11",
            [name, price, description, category, image_1, image_2, image_3,price_2,offer,image_4,id]
        );
        res.redirect("/addproduct");
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
            res.redirect("/homepage");
         }
         else {
         res.redirect(`/edit/${id}`); 
         }
        } 
        catch (err) { console.error(err); res.send("Error: " + err); }});




app.get("/delete/:id", async (req, res) => {
    const { id } = req.params;
    console.log("delete", id);

    try {
        const checkResult = await db.query("SELECT * FROM products WHERE id = $1", [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).send("Product not found");
        }

        await db.query("DELETE FROM products WHERE id = $1", [id]);
        res.redirect("/addproduct");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
    }
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
            res.redirect("/homepage");
        
    } catch (error) {
        console.log(error);
    }
    
});
app.post("/front",upload.fields([{name:'image'}]),async(req,res)=>{
    const image = req.files && req.files['image'] ? req.files['image'][0].filename : req.body.existingImage1;
    
    const{title,short_note,id,category}=req.body;

    try {
        
        await db.query(
            "UPDATE front SET image = $1,titel = $2, short_notes =$3,t_n =$4 ,category=$5 where id =$6",
            [image,title,short_note,"front",category,id]
        );
        res.redirect("/homepage");
    
} catch (error) {
    console.log(error);
}
   
    
});
app.post("/signup",async(req,res)=>{
const{email,password,re_password,first_name,phone} = req.body;
try {
    const user = await db.query("select email from users where email=$1",[email]);
    if(user.rows.length>0)
        {
       res.render("signup.ejs",({notes:"email"}));
    }
    else
    {
if(password === re_password){


        bcrypt.hash(password,salting_round,async(err,hash)=>{
            if(err){
                console.log("error while hassing",err);
            }
            else{
                 const result = await db.query("insert into users (first_name,email,phone,password) values($1,$2,$3,$4) returning *",[first_name,email,phone,hash]);
                 const user = result.rows[0];
                 req.login(user,(err)=>{
                    console.log("error in signup",err);
                    res.redirect("/checkout");
                    
                 })
            }
        });
    
        
    
    }
    else{
        res.render("signup.ejs",({notes:"password",first_name:first_name,email:email,phone:phone}));
    }
}
} catch (error) {
    console.log(error);
}

});



//testing for backwards
app.get("/checkout", async (req, res) => {
    const user = req.user;
    if (req.isAuthenticated()) {
        const type = "view";
        const orderid = 9;
        let total;

        // Ensure the cart is initialized
        req.session.cart = req.session.cart || [];
        console.log("Cart contents before checkout:", req.session.cart);

        const cart = req.session.cart;

        const cartItems = cart.map(item => [
            item.id,
            item.name,
            item.quantity,
            item.price,
            total = item.quantity * item.price,
            type,
            user.id,
            orderid
        ]);

        try {
            if (cartItems.length > 0) {
                const queryText = "INSERT INTO cart (product_id, product_name, quantity, price, total, cart_type, customer_id, order_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                for (const orderItem of cartItems) {
                    await db.query(queryText, orderItem);
                }
            }
        } catch (error) {
            console.log("Error inserting into cart:", error);
        }

        res.render("checkout.ejs", { cart, first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone, address: user.address, state: user.state, zip: user.zip, city: user.city, user_id: user.id });
    } else {
        res.redirect('/login');
    }
});
app.post("/login", (req, res, next) => {
    // Preserve the cart data before the login process
    const cartBeforeLogin = req.session.cart ? [...req.session.cart] : [];

    passport.authenticate("local", function (err, user, info) {
        if (err) {
            console.log("Error during authentication:", err);
            return next(err);
        }
        if (!user) {
            console.log("Authentication failed:", info.message);
            return res.render("login.ejs", { notes: info.message });
        }
        req.logIn(user, function (err) {
            if (err) {
                console.log("Error logging in:", err);
                return next(err);
            }

            // Restore the cart data after successful login
            req.session.cart = cartBeforeLogin;

            if (user.first_name === "admin" && user.role === "admin") {
                console.log("Redirecting to admin page");
                return res.redirect("/admin");
            }
            console.log("Login successful, redirecting to checkout");
            return res.redirect("/checkout");
        });
    })(req, res, next);
});



// session cart
// app.post("/login", (req, res, next) => {
//     passport.authenticate("local", function (err, user, info) {
//         if (err) {
//             console.log("Error during authentication:", err);
//             return next(err);
//         }
//         if (!user) {
//             console.log("Authentication failed:", info.message);
//             return res.render("login.ejs", { notes: info.message });
//         }
//         req.logIn(user, function (err) {
//             if (err) {
//                 console.log("Error logging in:", err);
//                 return next(err);
//             }
//             if (user.first_name === "admin" && user.role === "admin") {
//                 console.log("Redirecting to admin page");
//                 return res.redirect("/admin");
//             }
//             console.log("Login successful, redirecting to checkout");
//             return res.redirect("/checkout");
//         });
//     })(req, res, next);
// });
app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.get("/success/:id", async (req, res) => {
    const { id } = req.params;
    const status = "ordered";
    let total;
    const user = req.user;
    const date = new Date();
    req.session.cart = req.session.cart || [];
    const cart = req.session.cart;


    if (!req.session.processed) {
        req.session.processed = true; // Set flag to true

        const cartiteam = cart.map(item => [
            item.id,
            item.name,
            item.quantity,
            item.price,
            total = item.quantity * item.price,
            status,
            user.id,
            id,
            date
        ]);

        const queryText = "INSERT INTO orders (product_id, product_name, quantity, price, total, status, customer_id, order_id, order_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ,$9)";

        for (const orderItem of cartiteam) {
            await db.query(queryText, orderItem);
        }
        req.session.cart = [];
        req.session.processed = false;

        res.render("success.ejs", { order_id: id });
        
    } else {
        res.render("success.ejs", { order_id: id });
    }
});


//  app.get("/order",async(req,res)=>{
//     const result = await db.query("select o.order_id,o.customer_id,c.first_name,o.product_id,p.name as product_name,o.quantity,o.total,c.address,c.phone,c.state,c.zip,c.notes from orders o join users c on o.customer_id = c.id join products p on o.product_id = p.id order by c.id");
//     console.log(result.rows);
//     res.render("order.ejs");
//  })    

  app.get('/order', async (req, res) => {
     try { 
        const result = await db.query(` SELECT c.id AS customer_id, c.first_name, c.last_name,c.phone,c.email,c.address,c.state,c.city,c.zip,c.notes ,JSON_AGG( JSON_BUILD_OBJECT( 'order_id', o.order_id, 'product_id', o.product_id, 'product_name', p.name, 'quantity', o.quantity, 'total', o.total,'order_date', o.order_date,'Status',o.status,'product_price',o.price ) ) AS orders FROM orders o JOIN users c ON o.customer_id = c.id JOIN products p ON o.product_id = p.id GROUP BY c.id, c.first_name, c.last_name ORDER BY c.id; `); 
       
        res.render('order.ejs', { orders: result.rows }); 
    } 
        catch (error) 
        { 
            console.error('Error fetching orders:', error); 
            res.status(500).send('Error fetching orders'); 
        } }); 

app.post('/status',async(req,res)=>{
const {status,order_id}=req.body;
try {
    const result = await db.query('update orders set status=$1 where order_id = $2 ',[status,order_id]);
    res.redirect("/order");
} catch (error) {
    console.log("error in status update",error);
    res.status(500).send("error while updating status");
}

});
app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );
  app.get(
    "/auth/google/checkout",
    passport.authenticate("google", {
      successRedirect: "/checkout",
      failureRedirect: "/login",
    })
  );

  app.post('/create-order', async (req, res) => 
    { 
        const{first_name,last_name,email,phone,address,city,state,zip,notes,user_id}= req.body;
        const { amount ,currency} = req.body;  
       
        
         try
          { 
              
        const result = await db.query("update users set first_name = $1,last_name = $2,phone = $3, address = $4, city = $5, state = $6, zip = $7, notes = $8 where id = $9",[first_name,last_name,phone,address,city,state,zip,notes,user_id] );

     
            const order = await razorpay.orders.create(
                { 
                    amount: amount * 100, // amount in smallest currency unit
                    
                     currency: currency, receipt: 'order_rcptid_11' }
                    );
                
                      res.json(order); 
                      

                      
                      
                    } catch (error) 
                    { 
                        console.log("error at payment",error);
                        res.status(500).send(error);
                     } }); 

passport.use("local", new Strategy(async function verify(username, password, cb) {
    try {
        console.log("Attempting to log in with username:", username);
        if (username === "admin@gmail.com" && password === "admin") {
            console.log("Admin login successful");
            return cb(null, { id: 0, first_name: "admin", role: "admin" });
        }
        const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);
        if (result.rows.length === 0) {
            console.log("User not found");
            return cb(null, false, { message: "email" });
        }
        const stored = result.rows[0].password;
        const user = result.rows[0];

        if (stored === "google") {
            console.log("User signed up with Google");
            return cb(null, false, { message: "google" });
        } else {
            bcrypt.compare(password, stored, (err, valid) => {
                if (err) {
                    console.log("Error comparing passwords:", err);
                    return cb(err);
                } else if (valid) {
                    console.log("Password valid, login successful");
                    return cb(null, user);
                } else {
                    console.log("Invalid password");
                    return cb(null, false, { message: "password" });
                }
            });
        }
    } catch (error) {
        console.log("Error during login:", error);
        return cb(error);
    }
}));

passport.use(
    "google",
    new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/checkout",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
  },
  async (accessToken, refreshToken, profile, cb) => {
    try {
    //   console.log(profile);
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        profile.email,
      ]);
      if (result.rows.length === 0) {
        const newUser = await db.query(
          "INSERT INTO users (first_name, email, password) VALUES ($1, $2 ,$3)",
          [profile.given_name,profile.email, "google"]
        );
        return cb(null, newUser.rows[0]);
      } else {
        return cb(null, result.rows[0]);
      }
    } catch (err) {
      return cb(err);
    }
  }
  
  ));
passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });







// app.post('/create-order', async (req, res) => 
//     { 
//       const{first_name,last_name,email,phone,address,city,state,zip,notes,user_id}= req.body;
//         const { amount ,currency} = req.body;
//         const result = await db.query("select address from users where id = $1",[user_id]);
//         if(result.rows[0] == ""){
//             console.log(result.rows[0]);
//         }
//         else{
//             console.log("flase");
//         }
        
//          try
//           { 
//             const order = await razorpay.orders.create(
//                 { 
//                     amount: amount * 100, // amount in smallest currency unit
//                      currency: currency, receipt: 'order_rcptid_11' });
//                       res.json(order); 
//                       console.log(order);
//                     } catch (error) 
//                     { 
//                         console.log(error);
//                         res.status(500).send(error);
//                      } }); 




// app.get("/success/:id",async(req,res)=>{
//     const{id}=req.params;
//     const status="ordered";
//     let total;
//     const user = req.user;
//     const iteam= cart.map(item =>[
                
//                 item.id,
//                 item.name,
//                 item.quantity,
//                 item.price,
//                 total=item.quantity*item.price,
               
//              ]);
//            let orderItem = [];
             
//                 const queryText = "INSERT INTO orders ( product_id, product_name, quantity, price, total,status,customer_id,order_id) VALUES ($1, $2, $3, $4, $5, $6,$7,$8)";
//               for ( orderItem of iteam) 
//                 { 
//                    orderItem.push(iteam);
//                 } 
//             console.log(orderItem);
//                 res.render("success.ejs",({order_id:id}));
            

             
             
//  }) ;
// 









app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
