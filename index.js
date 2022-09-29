require("dotenv").config();
let Mongo = require("./services/database/mongodb");

(async () => {
  await Mongo.init();
  let TelegramBot = require("./services/telegram");
  await TelegramBot.init();
  TelegramBot.run();
})();
