import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import spotifyRoutes from './routes/spotify.routes.js';
import authRoutes from './routes/auth.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import getPlaylistTracks from './openAI/getPlaylistTracks.js';
import { connectToDatabase } from './services/database.js';
const app = express();
const PORT = process.env.PORT || 5200;

app.use(cors());
app.use(express.json());


console.log("✅ Mounting /api/auth routes");
app.use('/api/auth', authRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/spotify', spotifyRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.post('/test-ai', async (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    try {
        const tracks = await getPlaylistTracks(description);
        res.json({ tracks });
    } catch (err) {
        console.error('AI Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

connectToDatabase()
    .then(() => {
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('❌ Failed to connect to DB:', err.message);
        process.exit(1);
    });

