const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const StaticSchema = new Schema(
  {
    uid: {
      type: String,
      index: true,
      unique: true,
    },
    static: Object,
    positions: Object,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
module.exports = StaticSchema;
