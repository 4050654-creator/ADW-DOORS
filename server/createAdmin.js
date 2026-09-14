const dns = require("dns");

// MongoDB SRV DNS issue ke liye public DNS servers
dns.setServers([
  "1.1.1.1",
  "8.8.8.8",
]);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    // ==============================
    // ADMIN ACCOUNT DETAILS
    // ==============================

    const name = "ADW Store Admin";

    const email = "adwstoreadmin@gmail.com";

    const password = "adw@321#";

    // ==============================
    // CHECK EXISTING USER
    // ==============================

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      console.log("User already exists.");
      console.log("Updating this account to admin...");

      existingUser.name = name;
      existingUser.role = "admin";

      const hashedPassword =
        await bcrypt.hash(password, 10);

      existingUser.password = hashedPassword;

      await existingUser.save();

      console.log("");
      console.log("=================================");
      console.log("ADMIN ACCOUNT UPDATED");
      console.log("=================================");
      console.log(`Name: ${existingUser.name}`);
      console.log(`Email: ${existingUser.email}`);
      console.log("Role: admin");
      console.log(`Password: ${password}`);
      console.log("=================================");
      console.log("");
    } else {
      // ==============================
      // CREATE NEW ADMIN
      // ==============================

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const admin = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin",
      });

      console.log("");
      console.log("=================================");
      console.log("ADMIN ACCOUNT CREATED");
      console.log("=================================");
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log("Role: admin");
      console.log(`Password: ${password}`);
      console.log("=================================");
      console.log("");
    }

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
    console.log("You can now login as Admin.");
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("ADMIN CREATION ERROR");
    console.error("=================================");
    console.error(error.message);
    console.error("=================================");
    console.error("");

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore connection close error
    }

    process.exit(1);
  }
};

createAdmin();