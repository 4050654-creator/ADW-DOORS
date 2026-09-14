const dns = require("dns");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully ✅");

    const email = "ahmadtest@example.com";

    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found ❌");
      await mongoose.connection.close();
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log("=================================");
    console.log("Admin account created successfully ✅");
    console.log("Name:", user.name);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("=================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Make admin error ❌");
    console.error(error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

makeAdmin();