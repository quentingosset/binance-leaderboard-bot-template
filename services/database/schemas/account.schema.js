const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const UserSchema = new Schema(
  {
    id_telegram: {
      type: Number,
      index: true,
      unique: true,
    },
    username_telegram: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: String,
    first_name: {
      type: String,
      default: "",
    },
    last_name: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
module.exports = UserSchema;
