/**
 * @file  create connection of mongooDB
 * @author chopbk
 * @date 04/08/2021
 */
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const UserSchema = require("./schemas/account.schema");

class MongoDb {
  constructor() {}
  async init() {
    try {
      let username = process.env.MONGODB_USERNAME;
      let password = process.env.MONGODB_PASS;
      let options = {
        poolSize: 10,
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        autoIndex: true, //this is the code I added that solved it all
        keepAlive: true,
        useFindAndModify: false,
        user: username,
        pass: password,
      };
      let url = process.env.MONGO_URI;
      logger.debug("[mongoLoader] connect to " + url);
      await mongoose
        .connect(url, options)
        .then((data) => console.log(`Connect to ${url} success`))
        .catch((error) => console.log(error.message));
      this.UserModel = mongoose.model("User", UserSchema);
    } catch (error) {
      throw error;
    }
    return mongoose.connection;
  }
  getUserModel = () => {
    return this.UserModel;
  };
}
module.exports = new MongoDb();
