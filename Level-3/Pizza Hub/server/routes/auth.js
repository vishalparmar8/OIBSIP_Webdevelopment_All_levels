const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const verificationToken = crypto.randomBytes(20).toString('hex');
        
        // In dev mode, if no email is configured, auto-verify
        const isVerified = !(process.env.EMAIL_USER && process.env.EMAIL_PASS);
        
        const user = new User({ 
            name, 
            email, 
            password, 
            role, 
            verificationToken,
            isVerified: isVerified
        });
        await user.save();
        
        if (!isVerified) {
            const host = req.get('origin') || 'http://localhost:5173';
            const verificationUrl = `${host}/verify-email?token=${verificationToken}`;
            try {
                await sendEmail(email, 'Verify your email', `Please verify your email by clicking: ${verificationUrl}`);
            } catch (mailError) {
                console.error('CRITICAL: Mail sending failed, auto-verifying user for local development:', mailError);
                user.isVerified = true;
                user.verificationToken = undefined;
                await user.save();
                return res.status(201).json({ 
                    message: 'User registered. Email service failed, so account was auto-verified for your convenience.' 
                });
            }
        }
        
        res.status(201).json({ 
            message: isVerified 
                ? 'User registered and auto-verified (No email config found).' 
                : 'User registered. Please verify your email.' 
        });
    } catch (error) {
        console.error('Registration Error Details:', error);
        res.status(400).json({ error: error.message || 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: Account not found');
            return res.status(401).json({ error: 'Account not found with this email' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Incorrect password');
            return res.status(401).json({ error: 'Incorrect password' });
        }

        if (!user.isVerified) {
            console.log('Login failed: Email not verified');
            return res.status(401).json({ error: 'Email not verified. Please check your inbox or contact admin.' });
        }
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Login successful for:', email);
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Verify Email
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ error: 'Invalid token' });
        
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        
        const host = req.get('origin') || 'http://localhost:5173';
        const resetUrl = `${host}/reset-password?token=${token}`;
        
        try {
            await sendEmail(email, 'Reset Password', `Reset your password by clicking: ${resetUrl}`);
            res.json({ message: 'Reset email sent' });
        } catch (mailError) {
            console.error('Mail sending failed:', mailError);
            res.status(500).json({ error: 'Failed to send reset email. Please ensure email credentials are correct.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
        
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
