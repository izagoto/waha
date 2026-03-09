const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: DataTypes.STRING,

  email: {
    type: DataTypes.STRING,
    unique: true,
  },

  password: DataTypes.STRING,

  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },
});

module.exports = User;
