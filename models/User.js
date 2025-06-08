import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: String,
    email: {
        type: String,
        required: function () {
            return !!this.oauthProvider;
        },
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: function () {
            return !this.oauthProvider;
        }
    },
    oauthProvider: {
        type: String,
        enum: ['google', 'spotify', null]
    },
    spotifyId: String,
    spotifyAccessToken: String,
    spotifyRefreshToken: String
});
export const User = mongoose.models.User || mongoose.model('User', userSchema);