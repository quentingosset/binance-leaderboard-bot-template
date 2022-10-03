const mongoose = require("mongoose");

const Schema = mongoose.Schema;
//Create Schema
const UidInfo = new Schema(
  {
    uid: {
      type: String,
      index: true,
      unique: true,
    },
    nickName: String,
    performance: Object,
    static: Object,
    followerCount: Number,
    positionShared: Boolean,
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
module.exports = UidInfo;
