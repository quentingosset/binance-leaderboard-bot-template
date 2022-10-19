const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const GoodUidInfoSchema = new Schema(
  {
    uid: {
      type: String,
      index: true,
      unique: true,
    },
    static: Object,
    positions: Object,
    performance: Object,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
module.exports = GoodUidInfoSchema;
