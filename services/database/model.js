const MongoDb = require("./mongodb");
const logger = require("../utils/logger");
const UserModel = MongoDb.getUserModel();

module.exports = {
  getUserInfo,
  createMember,
  findOrCreate,
  updateUserInfo,
  getAllUserInfo,
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
