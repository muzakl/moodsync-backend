import mongoose from 'mongoose';

export const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB:', mongoose.connection.db.databaseName);
    } catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
};

