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

// Middleware to initialize cart in session if it doesn't exist
router.use(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const userId = req.user.id;
        try {
            const result = await db.query("SELECT * FROM user_cart WHERE user_id = $1", [userId]);
            req.session.cart = result.rows;
        } catch (err) {
            console.error('Error fetching cart from database:', err);
            return res.status(500).send('Error fetching cart from database');
        }
    } else {
        if (!req.session.cart) {
            req.session.cart = [];
        }
    }
    next();
});

// Add item to the cart
router.post("/add", async (req, res) => {
    const { id, image,product_name, price, quantity } = req.body;

    if (req.isAuthenticated()) {
        const userId = req.user.id;
        try {
            const result = await db.query("SELECT * FROM user_cart WHERE user_id = $1 AND product_id = $2", [userId, id]);
            if (result.rows.length > 0) {
                await db.query("UPDATE user_cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3", [quantity, userId, id]);
            } else {
                await db.query("INSERT INTO user_cart (user_id, product_id, product_name, price, quantity,image) VALUES ($1, $2, $3, $4, $5,$6)", [userId, id, product_name, price, quantity,image]);
            }
        } catch (err) {
            console.error('Error adding item to cart:', err);
            return res.status(500).send('Error adding item to cart');
        }
    } else {
        const item = req.session.cart.find(item => item.id === id);
        if (item) {
            item.quantity += parseInt(quantity);
        } else {
            req.session.cart.push({ id, product_name,image, price:parseInt(price), quantity: parseInt(quantity) });
        }
    }

    res.redirect("/cart");
});

// Update quantity in the cart
router.post("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { quantity ,product_id} = req.body;

    if (req.isAuthenticated()) {
        const userId = req.user.id;
        try {
          
          await db.query("UPDATE user_cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 returning*", [quantity, userId, product_id]);
        
        } catch (err) {
            console.error('Error updating cart item:', err);
            return res.status(500).send('Error updating cart item');
        }
    } else {
        const item = req.session.cart.find(item => item.id === id);
        if (item) {
            item.quantity = parseInt(quantity);
        }
    }

    res.redirect("/cart");
});

// Remove item from the cart
router.post("/remove/:id/:product_id", async (req, res) => {
    const { id ,product_id} = req.params;

    if (req.isAuthenticated()) {
        const userId = req.user.id;
        try {
            await db.query("DELETE FROM user_cart WHERE user_id = $1 AND product_id = $2", [userId, product_id]);
        } catch (err) {
            console.error('Error removing item from cart:', err);
            return res.status(500).send('Error removing item from cart');
        }
    } else {
        req.session.cart = req.session.cart.filter(item => item.id !== id);
    }

    res.redirect("/cart");
});

// Render the cart page
router.get("/", (req, res) => {
    console.log('cart',req.session.cart);
    res.render("cart.ejs", { cart: req.session.cart });
});

export default router;


// import express from 'express';

// const router = express.Router();

// // Middleware to initialize cart in session if it doesn't exist
// router.use((req, res, next) => {
//     if (!req.session.cart) {
//         req.session.cart = [];
//     }
//     next();
// });

// // Update quantity in the cart
// router.post("/update/:id", (req, res) => {
//     const { id } = req.params;
//     const { quantity } = req.body;

//     const item = req.session.cart.find(item => item.id === id);
//     if (item) {
//         item.quantity = parseInt(quantity);
//     }

//     res.redirect("/cart");
// });

// // Remove item from the cart
// router.post("/remove/:id", (req, res) => {
//     const { id } = req.params;

//     req.session.cart = req.session.cart.filter(item => item.id !== id);

//     res.redirect("/cart");
// });

// // Add item to the cart
// router.post("/add", (req, res) => {
//     const { id, name, price, quantity, image } = req.body;

//     const item = req.session.cart.find(item => item.id === id);
//     if (item) {
//         item.quantity += parseInt(quantity);
//     } else {
//         req.session.cart.push({ id, name, image, price, quantity: parseInt(quantity) });
//     }

//     res.redirect("/cart");
// });


// // Render the cart page
// router.get("/", (req, res) => {
//     res.render("cart.ejs", { cart: req.session.cart });
// });

// export default router;