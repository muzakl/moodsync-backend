import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const registerUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ error: 'Username already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashed });
        await user.save();

        res.status(201).json({ message: 'Registered successfully', userId: user._id });
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

export const linkSpotify = async (req, res) => {
    const { userId, spotifyId } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { spotifyId }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Spotify account linked', user });
    } catch (err) {
        console.error('Spotify link error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};