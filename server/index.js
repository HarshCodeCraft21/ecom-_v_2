import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';

// Load environment variables early in execution lifecycle
dotenv.config({
  path: './.env'
});

const PORT = process.env.PORT || 5000;

// Establish database connection first, then start listening
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Express App encountered an unexpected error: ", error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`⚙️ Server is running in ${process.env.NODE_ENV} mode on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB database connection failed: ", err.message);
  });
