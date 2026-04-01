import mongoose from 'mongoose';

const dbConection = async () => {
    try {
        const mongo = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`MongoDB Connected: ${mongo.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.warn('⚠️  MongoDB connection failed. Server running without database.');
    }
}

export default dbConection;