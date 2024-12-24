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
            const result = await db.query(`
                SELECT order_id, order_date, status, SUM(total) as total, json_agg(json_build_object('product_name', product_name, 'quantity', quantity, 'price', price)) as products
                FROM orders
                WHERE customer_id = $1
                GROUP BY order_id, order_date, status
                ORDER BY order_date DESC
            `, [req.user.id]);
    
            const orders = result.rows;
            res.render("dashboard.ejs", { user: req.user, orders });
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