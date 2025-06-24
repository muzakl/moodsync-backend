import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    password: {
        type: String,
        required: function () {
            return !this.oauthProvider;
        }
    },
    oauthProvider: {
        type: String,
        enum: ['google', null],
        default: null
    }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);