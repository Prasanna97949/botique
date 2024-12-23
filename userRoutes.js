import express from 'express';
import pg from 'pg'; // Adjust the import based on your project structure
import env from 'dotenv';

env.config();
const router = express.Router();
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});


router.get("/profile", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("profile.ejs", { user: req.user });
    } else {
        res.redirect("/login");
    }
});

router.post("/profile/update", async (req, res) => {
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

router.get('/dashboard', async (req, res) => { 
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

export default router;