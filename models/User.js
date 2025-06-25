// // models folder user.js
// import mongoose from 'mongoose';
//
// const userSchema = new mongoose.Schema({
//     username: { type: String, unique: true, sparse: true },
//     email: { type: String, unique: true, sparse: true },
//     password: {
//         type: String,
//         required: function () {
//             return !this.oauthProvider;
//         }
//     },
//     oauthProvider: {
//         type: String,
//         enum: ['google', null],
//         default: null
//     }
// }, { timestamps: true });
//
// export const User = mongoose.models.User || mongoose.model('User', userSchema);
//
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
    },
    title: { type: String, default: 'Moodsync user' },
    bio: { type: String, default: 'Write your bio here...' }
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
