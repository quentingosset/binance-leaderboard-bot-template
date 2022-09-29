const listText = require("./list-text");
const refreshPosition = (uid) => {
  return {
    resize_keyboard: true,
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

module.exports = {
  refreshPosition,
};
