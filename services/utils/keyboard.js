const listText = require("./list-text");
const refreshPosition = (uid) => {
  return {
    resize_keyboard: true,
    one_time_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "Refresh",
          callback_data: `POSITION_${uid}`,
        },
      ],
    ],
  };
};
const refreshHistoryPosition = (uid) => {
  return {
    resize_keyboard: true,
    one_time_keyboard: true,
    inline_keyboard: [
      [
        {
          text: "Refresh",
          callback_data: `STATIC_${uid}`,
        },
      ],
    ],
  };
};
module.exports = {
  refreshPosition,
  refreshHistoryPosition,
};
