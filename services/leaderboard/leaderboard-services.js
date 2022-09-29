const logger = require("../utils/logger");

let binanceProfileLeaderboardLink =
  "https://www.binance.com/en/futures-activity/leaderboard?type=myProfile&encryptedUid=";
const BinanceLeaderboardApi = require("../leaderboard/leaderboard-api");
const LONG = "LONG";
const SHORT = "SHORT";
const buildPositionsMsg = async (uid) => {
  let pos = null;
  let positions = await getCurrentPositionInfo(uid);
  // build message for getposition
  logger.debug(`[buildPositionsMsg] ${uid} `);
  let text = `${uid}`;
  text += `\n---------${positions.length} [positions](${
    binanceProfileLeaderboardLink + uid
  })------`;
  if (positions.length !== 0) {
    for (let i = 0; i < positions.length; i++) {
      pos = positions[i];
      text += `
  ✅*${pos.side}* ${pos.amount} #${pos.symbol}
  💵${pos.cost}✖️${pos.leverage}🏦${pos.volume}${pos.currency}
  ▶️${pos.entryPrice} 🔍${pos.markPrice}
  🟢${pos.roe}% 💰${pos.pnl}$
  -------------------------`;
    }
  }
  return text;
};

const getCurrentPositionInfo = async (uid) => {
  let res = await BinanceLeaderboardApi.getOtherPosition(uid);
  let data = [];
  let positions = res.otherPositionRetList;
  logger.debug(`[getPositionInfo] ${JSON.stringify(positions)}`);
  if (positions !== 0) {
    data = positions.map((pos) => {
      let side = pos.amount > 0 ? LONG : SHORT;
      let leverage = 0;
      if (pos.roe !== 0)
        leverage = Math.round(
          pos.roe / ((pos.markPrice - pos.entryPrice) / pos.entryPrice)
        );
      pos.pnl = pos.pnl.toFixed(2);
      pos.roe = (pos.roe * 100).toFixed(2);
      let volume = (pos.amount * pos.entryPrice).toFixed(2);
      let cost = (volume / leverage).toFixed(2);
      let currency = pos.symbol.substring(pos.symbol.length - 4);
      return {
        ...pos,
        side,
        cost,
        leverage,
        volume,
        currency,
      };
    });
  }
  return data;
};
const getHistoryPositionInfo = async (uid) => {
  let positions = await BinanceLeaderboardApi.getRecentPosition(uid);
  let data = [];
  logger.debug(`[getPositionInfo] ${JSON.stringify(positions)}`);
  if (positions !== 0) {
    data = positions.map((pos) => {
      let side = pos.amount > 0 ? LONG : SHORT;
      let leverage = 0;
      if (pos.roe !== 0)
        leverage = Math.round(
          pos.roe / ((pos.markPrice - pos.entryPrice) / pos.entryPrice)
        );
      pos.pnl = pos.pnl.toFixed(2);
      pos.roe = (pos.roe * 100).toFixed(2);
      let volume = (pos.amount * pos.entryPrice).toFixed(2);
      let cost = (volume / leverage).toFixed(2);
      let currency = pos.symbol.substring(pos.symbol.length - 4);
      return {
        ...pos,
        side,
        cost,
        leverage,
        volume,
        currency,
      };
    });
  }
  return data;
};
module.exports = {
  buildPositionsMsg,
};
