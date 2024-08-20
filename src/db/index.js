import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const dbConnent = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\nMongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection FAILED", error);
        process.exit(1);
    }
}

export default dbConnent;