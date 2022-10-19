const MongoDb = require("./mongodb");
const logger = require("../utils/logger");
const UserModel = MongoDb.getUserModel();
const UidInfoModel = MongoDb.UidInfoModel;
const StaticModel = MongoDb.StaticModel;
const PerformanceModel = MongoDb.PerformanceModel;
const GoodUidInfoModel = MongoDb.GoodUidInfoModel;

module.exports = {
  getUserInfo,
  createMember,
  findOrCreate,
  updateUserInfo,
  getAllUserInfo,
  getUidInfo,
  createUidInfo,
  findPerfomanceOfUidInfo,
  createPerfomanceOfUidInfo,
  findStaticOfUid,
  createStaticOfUid,
  findGoodUidInfo,
  createGoodUidInfo,
  findAllPerfomanceInfo,
  findAllGoodUidInfo,
};
async function getAllUserInfo() {
  return UserModel.find({ role: "user" });
}
async function getUserInfo(id_telegram) {
  return UserModel.findOne({ id_telegram: id_telegram });
}

async function createMember(params) {
  let account = new UserModel({
    id_telegram: params.id,
    username_telegram: params.username,
    first_name: params.first_name,
    last_name: params.last_name,
  });
  return account.save();
}
async function findOrCreate(msg, ref = "") {
  let account = await getUserInfo(msg.from.id);
  logger.debug(
    `findOrCreate ${msg.from.id} ${!!account ? account.username_telegram : ""}`
  );
  if (!account) {
    account = await createMember({ ...msg.from, ref: ref, captcha: "" });
    return false;
  }
  return account;
}
async function updateUserInfo(id_telegram, obj) {
  logger.debug(
    `[updateUserInfo] id_telegram ${id_telegram} ${JSON.stringify(obj)}`
  );
  let memmber = await UserModel.findOneAndUpdate(
    { id_telegram: id_telegram },
    obj
  );
  logger.debug(`[updateUserInfo] Member Update} ${JSON.stringify(memmber)}`);
  return;
}

async function getUidInfo(uid) {
  return UidInfoModel.findOne({ uid: uid });
}
async function createUidInfo(params) {
  let uidInfo = new UidInfoModel(params);
  return uidInfo.save();
}

async function findPerfomanceOfUidInfo(uid) {
  let d = new Date();
  let todayString =
    d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  let today = new Date(todayString);
  return PerformanceModel.findOne({ uid: uid, updatedAt: { $gte: today } });
}
async function findAllPerfomanceInfo() {
  return PerformanceModel.find({});
}

async function createPerfomanceOfUidInfo(params) {
  await PerformanceModel.findOneAndUpdate({ uid: params.uid }, params, {
    upsert: true,
  });
}

async function findStaticOfUid(uid) {
  let d = new Date();
  let todayString =
    d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  let today = new Date(todayString);
  return StaticModel.findOne({ uid: uid, updatedAt: { $gte: today } });
}
async function createStaticOfUid(params) {
  await StaticModel.findOneAndUpdate({ uid: params.uid }, params, {
    upsert: true,
  });
}

async function findAllGoodUidInfo() {
  return GoodUidInfoModel.find({});
}
async function findGoodUidInfo(uid) {
  return GoodUidInfoModel.findOne({ uid: uid });
}
async function createGoodUidInfo(params) {
  await GoodUidInfoModel.findOneAndUpdate({ uid: params.uid }, params, {
    upsert: true,
  });
}
