import express from 'express';

const router = express.Router();

// Middleware to initialize cart in session if it doesn't exist
router.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    next();
});

// Update quantity in the cart
router.post("/update/:id", (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = req.session.cart.find(item => item.id === id);
    if (item) {
        item.quantity = parseInt(quantity);
    }

    res.redirect("/cart");
});

// Remove item from the cart
router.post("/remove/:id", (req, res) => {
    const { id } = req.params;

    req.session.cart = req.session.cart.filter(item => item.id !== id);

    res.redirect("/cart");
});

// Add item to the cart
router.post("/add", (req, res) => {
    const { id, name, price, quantity, image } = req.body;

    const item = req.session.cart.find(item => item.id === id);
    if (item) {
        item.quantity += parseInt(quantity);
    } else {
        req.session.cart.push({ id, name, image, price, quantity: parseInt(quantity) });
    }

    res.redirect("/cart");
});


// Render the cart page
router.get("/", (req, res) => {
    res.render("cart.ejs", { cart: req.session.cart });
});

export default router;