import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
import axios from 'axios';

export const registerUser = async (req, res) => {
    const {username, password} = req.body;
    console.log(req.body)
    console.log(username, password)

    if (!username || typeof username !== 'string' || password.length < 6) {
        return res.status(400).json({error: 'Invalid username or password'});
    }

    try {
        const existing = await User.findOne({username});
        if (existing) return res.status(400).json({error: 'Username already exists'});

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({username, password: hashed});
        await user.save();

        res.status(201).json({message: 'Registered successfully', userId: user._id});
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({error: 'Server error'});
    }
};

export const loginUser = async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(401).json({error: 'Invalid credentials'});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.json({token, userId: user._id});
        console.log('User logged in:', user._id);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({error: 'Server error'});
    }
};

export const spotifyLogin = (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId for Spotify linking" });
    }

    const scope = 'user-read-email user-read-private';
    const redirectUri = encodeURIComponent(process.env.SPOTIFY_REDIRECT_URI);

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state=${userId}`;

    res.redirect(authUrl);
};
export const spotifyCallback = async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state;

    if (!code || !userId) {
        return res.status(400).json({ error: 'Missing code or user ID' });
    }

    try {
        const tokenRes = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            client_id: process.env.SPOTIFY_CLIENT_ID,
            client_secret: process.env.SPOTIFY_CLIENT_SECRET
        }).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, refresh_token } = tokenRes.data;

        const profileRes = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const spotifyId = profileRes.data.id;

        await User.findByIdAndUpdate(userId, {
            spotifyId,
            spotifyAccessToken: access_token,
            spotifyRefreshToken: refresh_token
        });

        res.redirect('http://localhost:5173/playlist');
    } catch (err) {
        console.error('Spotify callback error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Spotify login failed' });
    }
};
export const googleLogin = (req, res) => {
    const redirectUri = encodeURIComponent("http://localhost:5000/api/auth/google/callback");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const scope = encodeURIComponent("https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile");

    const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    res.redirect(authUrl);
};
export const googleCallback = async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(400).json({ error: 'No authorization code provided' });
        }

        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            null,
            {
                params: {
                    code,
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                    grant_type: 'authorization_code',
                },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );
        const { access_token } = tokenResponse.data;

        const userInfoResponse = await axios.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            { headers: { Authorization: `Bearer ${access_token}` } }
        );
        const { email, name } = userInfoResponse.data;

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ username: name, email, oauthProvider: 'google' });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(
            `${frontendUrl}/login?token=${token}&userId=${user._id}`
        );
    } catch (err) {
        console.error('Google callback error:', {
            message: err.message,
            response: err.response?.data,
            stack: err.stack,
        });
        res.status(500).json({ error: 'Google login failed' });
    }
};
// export const getUserSpotifyTracks = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
//
//         if (!user.spotifyAccessToken) {
//             return res.status(400).json({ error: 'Spotify not linked.' });
//         }
//
//         const response = await axios.get('https://api.spotify.com/v1/me/tracks?limit=20', {
//             headers: {
//                 Authorization: `Bearer ${user.spotifyAccessToken}`
//             }
//         });
//
//         res.json(response.data);
//     } catch (err) {
//         console.error('Error fetching tracks:', err.response?.data || err.message);
//         res.status(500).json({ error: 'Failed to fetch Spotify tracks' });
//     }
// };
//
// export const getUserInfo = async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) return res.status(404).json({ error: 'User not found' });
//         res.json({
//             userId: user._id,
//             username: user.username,
//             spotifyLinked: !!user.spotifyId
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };