import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import axios from 'axios';

export const registerUser = async (req, res) => {
    console.log("req.body:", req.body);
    const { username, password } = req.body;
    console.log("Incoming register request body:", req.body);

    if (!username || typeof username !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ error: 'Username already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashed });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: 'Registered successfully', token, userId: user._id });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


export const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};


export const googleLogin = (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = encodeURIComponent("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile");

    const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=offline&prompt=consent`;
    res.redirect(authUrl);
};

export const googleCallback = async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) return res.redirect(`${process.env.FRONTEND_URL}/login`);

        const tokenRes = await axios.post(
            'https://oauth2.googleapis.com/token',
            new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenRes.data;
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const { email, name } = userInfo.data;
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ username: name, email, oauthProvider: 'google' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/google-linked?token=${token}&userId=${user._id}`);
    } catch (err) {
        console.error('Google callback error:', err.response?.data || err.message);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
};



export const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ userId: user._id, username: user.username });
    } catch (err) {
        console.error('User info error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};