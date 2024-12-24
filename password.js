import express from 'express';
import bcrypt from 'bcrypt';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import pg from 'pg';

const router = express.Router();
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

// Route to render the forgot password form
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password.ejs');
});

// Route to handle forgot password form submission
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(400).send('No account with that email address exists.');
        }

        const user = result.rows[0];
        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiration = Date.now() + 3600000; // 1 hour

        await db.query("UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3", [token, tokenExpiration, user.id]);

        const oAuth2Client = new google.auth.OAuth2(
            process.env.OAUTH_CLIENTID,
            process.env.OAUTH_CLIENT_SECRET,
            process.env.OAUTH_REDIRECT_URI
        );
        oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });
        const accessToken = await oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.OAUTH_CLIENTID,
                clientSecret: process.env.OAUTH_CLIENT_SECRET,
                refreshToken: process.env.OAUTH_REFRESH_TOKEN,
                accessToken: accessToken.token,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   http://${req.headers.host}/reset-password/${token}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);

        res.render('forgot-password.ejs', { message: 'An e-mail has been sent to ' + email + ' with further instructions.' });
    } catch (error) {
        console.error('Error processing forgot password request:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Route to render the password reset form
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const result = await db.query("SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2", [token, Date.now()]);
        if (result.rows.length === 0) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        res.render('reset-password.ejs', { token });
    } catch (error) {
        console.error('Error rendering password reset form:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Route to handle password reset form submission
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const result = await db.query("SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > $2", [token, Date.now()]);
        if (result.rows.length === 0) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        const user = result.rows[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query("UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2", [hashedPassword, user.id]);

        
        res.render("login.ejs", { message: 'Password successfully reset. Please log in.' });
    } catch (error) {
        console.error('Error processing password reset:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

export default router;