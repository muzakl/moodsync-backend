import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    artist: { type: String, required: true },
    img: { type: String, default: '' }
}, { _id: false });

const playlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'Untitled Playlist' },
    description: { type: String, default: 'No Description' },
    privacy: { type: String, enum: ['Public', 'Private'], default: 'Public' },
    image: { type: String, default: '' },
    tracks: [trackSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


playlistSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Playlist = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);

export default Playlist;