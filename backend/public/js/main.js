const mongoose = require("mongoose");

// Your MongoDB Atlas connection URI
const uri =
  "mongodb+srv://nguyenDev:RDjNXf0lkqaB1LTg@cluster0-nguyendev.ch3oe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-Nguyendev";

// Replace <username> and <password> with your Atlas database credentials
// Replace 'myFirstDatabase' with your database name

// Connect to MongoDB Atlas
mongoose
  .connect(uri, {
    useNewUrlParser: true, // Ensures use of new MongoDB driver
    useUnifiedTopology: true, // Ensures proper connection handling
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
  });

// Create a simple schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);

// Create a new user
const newUser = new User({
  name: "Mai Van Manh",
  email: "mvmanh@example.com",
});

// Save the new user to the database
newUser
  .save()
  .then((user) => {
    console.log("User saved:", user);
  })
  .catch((err) => {
    console.error("Error saving user:", err);
  });