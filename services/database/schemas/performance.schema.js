const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const PerformanceSchema = new Schema(
  {
    uid: {
      type: String,
      index: true,
      unique: true,
    },
    ROI: Object,
    PNL: Object,
    isGood: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
module.exports = PerformanceSchema;
