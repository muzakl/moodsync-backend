import express from 'express';
import Playlist from '../models/playlist.js';
import { authenticateUser } from '../middlwear/auth.js';
const router = express.Router();
import multer from 'multer';

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
        cb(null, true);
    }
});

router.post('/create', authenticateUser, upload.single('image'), async (req, res) => {
    const { name, description, privacy, tracks } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : '';

    try {
        const playlist = new Playlist({
            userId: req.user.id,
            name,
            description,
            privacy,
            image,
            tracks: JSON.parse(tracks)
        });

        await playlist.save();
        res.status(201).json({ message: 'Playlist created', playlist });
    } catch (err) {
        console.error('Create playlist error:', err);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});


router.get('/my', authenticateUser, async (req, res) => {
    try {
        const playlists = await Playlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(playlists);
    } catch (err) {
        console.error('Fetch playlists error:', err);
        res.status(500).json({ error: 'Could not fetch playlists' });
    }
});


router.delete('/:id', authenticateUser, async (req, res) => {
    try {
        const deleted = await Playlist.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!deleted) return res.status(404).json({ error: 'Playlist not found' });

        res.json({ message: 'Playlist deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete' });
    }
});


router.put('/:id', authenticateUser, async (req, res) => {
    try {
        const updated = await Playlist.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Playlist not found' });

        res.json(updated);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ error: 'Failed to update' });
    }
});

export default router;