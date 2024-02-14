import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

// dotenv configration
dotenv.config(
  {
    path: './.env'
  }
);

// Connect to the database
connectDB()
.then(() => {

  app.on('error', (err) => {
    console.log('Error connecting to the database', err);
  });

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
})
.catch((err) => {
  console.log('Error connecting to the database', err);
});


