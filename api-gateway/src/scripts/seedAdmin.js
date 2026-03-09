require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");
const User = require("../models/user");

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin123";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Admin";

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    if (existing) {
      existing.role = "admin";
      existing.password = hash;
      existing.name = ADMIN_NAME;
      await existing.save();
      console.log("User updated to admin:", ADMIN_EMAIL);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hash,
        role: "admin",
      });
      console.log("Admin user created:", ADMIN_EMAIL);
    }
    console.log("Login dengan email:", ADMIN_EMAIL, "password:", ADMIN_PASSWORD);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
