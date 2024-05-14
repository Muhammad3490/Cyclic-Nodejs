require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;
const UserModal = require("./Models/user");
const NoteModal = require("./Models/note");

mongoose.set("strictQuery", false);
app.use(express.json());

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Mongo DB connect ${conn.connect.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
//implementation
app.post("/add/user", async (req, res) => {
  try {
    const { name, email, picture, emailVerified, userId } = req.body;
    if (!name || !email || !picture || !emailVerified || !userId) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    const newUser = await UserModal.create({
      name,
      userId,
      email,
      picture,
      emailVerified,
    });
    //   const userWithEmail = await UserModal.findOne({ email: email });
    console.log("Result:", newUser);
    return res.status(201).json({ status: "User added successfully" });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
