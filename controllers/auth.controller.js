import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {connectToDatabase} from "../services/database.js";

export const registerUser = async (req, res) => {
    const username = req.body.username?.trim();
    const password = req.body.password?.trim();


    if (typeof username !== 'string' || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Username and password must be valid and at least 6 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const database = await connectToDatabase();
        const usersCollection = database.collection('users');
        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const newUser = {
            username,
            password: hashedPassword,
            createdAt: new Date(),
        };
        await usersCollection.insertOne(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
export const loginUser = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if ( !username || !password ) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const database = await connectToDatabase();
        const usersCollection = database.collection('users');
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}