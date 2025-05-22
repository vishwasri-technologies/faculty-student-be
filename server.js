const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>{
        console.log(`Server running on port ${process.env.PORT}`);
        console.log('Connected to MongoDB');
      }
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
