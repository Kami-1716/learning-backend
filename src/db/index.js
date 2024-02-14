import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {

    try {
      const dbInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      console.log(`\n MongoDB connected!! connection host: ${dbInstance.connection.host} \n`)
      
    } catch (error) {
      console.log('Error connecting to the database');
      process.exit(1);
    }
}

export default connectDB;