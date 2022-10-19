const logger = require("../utils/logger");
const { getUidInfo, createUidInfo } = require("../database/model");
let binanceProfileLeaderboardLink =
  "https://www.binance.com/en/futures-activity/leaderboard?type=myProfile&encryptedUid=";
const BinanceLeaderboardApi = require("../leaderboard/leaderboard-api");
const LONG = "LONG";
const SHORT = "SHORT";
const findUidInfoOrCreate = async (uid) => {
  let info = await getUidInfo(uid);
  if (!info) {
    info = await BinanceLeaderboardApi.getOtherLeaderboardBaseInfo(uid);
    info.uid = uid;
    await createUidInfo(info);
  }
  return info;
};

const buildPositionsMsg = async (uid) => {
  let positions = await getCurrentPositionInfo(uid);
  let info = await findUidInfoOrCreate(uid);
  // build message for getposition
  logger.debug(`[buildPositionsMsg] ${uid} `);
  let text = `\`${uid}\`:`;
  text += `\n---------${positions.length} [positions](${
    binanceProfileLeaderboardLink + uid
  }) of *${info.nickName.replace(/ |-/g, "_")}*------`;
  text += buildPositionText(positions);
  return toEscapeMSg(text);
};
const buildPositionText = (positions) => {
  let text = "";
  if (positions.length !== 0) {
    for (let i = 0; i < positions.length; i++) {
      let pos = positions[i];
      text += `
✅*${pos.side}* ${pos.amount} #${pos.symbol}
💵${pos.cost}✖️${pos.leverage}🏦${pos.volume}${pos.currency}
▶️${pos.entryPrice} 🔍${pos.markPrice}
🟢${pos.roe}% 💰${pos.pnl}$
⏱${new Date(pos.updateTimeStamp).toISOString()}
          -------------------------`;
    }
  }
  return text;
};

const getCurrentPositionInfo = async (uid) => {
  let res = await BinanceLeaderboardApi.getOtherPosition(uid);
  let data = [];
  if (!res.otherPositionRetList) return [];
  let positions = res.otherPositionRetList;
  logger.debug(`[getPositionInfo] ${JSON.stringify(positions)}`);
  if (positions.length !== 0) {
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

const getStaticOfRecentPosition = async (uid) => {
  let positions = await BinanceLeaderboardApi.getRecentPosition(uid);
  let data = [];
  let static = {
    uid: uid,
    totalWin: 0,
    totalLoss: 0,

    totalPnl: 0,
    totalRoe: 0,

    pnlOfWin: 0,
    roeOfWin: 0,
    tpWin: 0,
    maxTpWin: 0,
    avgTpWin: 0,

    pnlOfLoss: 0,
    roeOfLoss: 0,
    stopLoss: 0,
    maxStoploss: 0,
    avgStopLoss: 0,

    h1: 0,
    h4: 0,
    day: 0,
    days: 0,
    from: null,
    to: null,
    success: false,
    symbols: {},
  };
  let tp = 0,
    stoploss = 0;
  logger.debug(`[getStaticOfRecentPosition] ${positions.length}`);
  if (positions.length !== 0) {
    static.from = positions[0].createTimeStamp;
    static.to = positions[0].createTimeStamp;
    static.maxTpWin = static.maxStoploss = positions[0].roe;

    data = positions.map((pos) => {
      if (!!static.symbols[pos.symbol]) {
        static.symbols[pos.symbol]++;
      } else static.symbols[pos.symbol] = 1;
      // calculate
      let range = pos.updateTimeStamp - pos.createTimeStamp;
      if (range < 60 * 60 * 1000) static.h1++;
      else if (range < 4 * 60 * 60 * 1000) static.h4++;
      else if (range < 24 * 60 * 60 * 1000) static.day++;
      else static.days++;

      // get static of closed position
      if (pos.closed == true) {
        if (static.from > pos.createTimeStamp)
          static.from = pos.createTimeStamp;
        if (static.to < pos.createTimeStamp) static.to = pos.createTimeStamp;

        if (pos.pnl > 0) {
          static.pnlOfWin += pos.pnl;
          static.roeOfWin += pos.roe;
          if (pos.leverage > 0) {
            tp = pos.roe / pos.leverage;
            static.tpWin += tp;
            if (tp > static.maxTpWin) static.maxTpWin = tp;
          }
          static.totalWin++;
        } else {
          static.pnlOfLoss += pos.pnl;
          static.roeOfLoss += pos.roe;
          if (pos.leverage > 0) {
            stoploss = pos.roe / pos.leverage;
            static.stopLoss += stoploss;
            if (stoploss < static.maxStoploss) static.maxStoploss = stoploss;
          }
          static.totalLoss++;
        }

        static.totalRoe += pos.roe;
        static.totalPnl += pos.pnl;
      }

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
    static.total = static.totalWin + static.totalLoss;
    static.avgPnl = (static.totalPnl / static.total).toFixed(2);
    static.avgRoe = ((static.totalRoe * 100) / static.total).toFixed(2);
    static.totalRoe = (static.totalRoe * 100).toFixed(2);
    static.totalPnl = static.totalPnl.toFixed(2);
    static.winRate = ((static.totalWin * 100) / static.total).toFixed(2);
    static.range = Math.round((static.to - static.from) / 86400000);
    static.from = new Date(static.from).toLocaleDateString();
    static.to = new Date(static.to).toLocaleDateString();
    //static.nickName = positions[0].nickName;
    static.success = true;
    static.pnlOfWin = static.pnlOfWin.toFixed(2);
    static.pnlOfLoss = static.pnlOfLoss.toFixed(2);
    static.maxTpWin = (static.maxTpWin * 10 * 100).toFixed(2);
    static.maxStoploss = (static.maxStoploss * 10 * 100).toFixed(2);
    static.roeOfWin = (static.roeOfWin * 100).toFixed(2);
    static.roeOfLoss = (static.roeOfLoss * 100).toFixed(2);
    static.avgTpWin = ((static.tpWin * 10 * 100) / static.total).toFixed(2);
    static.avgStopLoss = ((static.stopLoss * 10 * 100) / static.total).toFixed(
      2
    );
  }
  return {
    static,
    positions: data,
  };
};

const buildStaticPositionMsg = async (uid, detail = false) => {
  let { static, positions } = await getStaticOfRecentPosition(uid);
  let info = await findUidInfoOrCreate(uid);
  // build message for getposition
  logger.debug(`[buildPositionsMsg] ${uid} `);
  if (static.success == false) return `🔴 Not found history position of ${uid}`;
  let text = `#STATIC OF *#${info.nickName.replace(/ |-/g, "_")}*\n\`${uid}\``;
  text += buildAnalysisOfUidMsg(static);
  if (detail) text += buildPositionText(positions);
  logger.debug(text);
  return toEscapeMSg(text);
};
const buildAnalysisOfUidMsg = (static) => {
  let text = ``;
  text += `
  ⏳${static.from}➡️${static.to} (${static.range} days)`;
  text += `\n---------${static.total} [positions](${
    binanceProfileLeaderboardLink + static.uid
  })--------
  💰 ${static.totalPnl}$ ${static.totalRoe}% 
  💵 A: ${static.avgPnl}$ ${static.avgRoe}%
  ✅ ${static.totalWin} (${static.winRate}%) ❌ ${static.totalLoss}
  -------------------
  🏦 ${static.pnlOfWin}$ ❤️ ${static.roeOfWin}% 
  🎯 A: ${static.avgTpWin}% M: ${static.maxTpWin}%(10x)
  -------------------
  💦${static.pnlOfLoss}$  💸${static.roeOfLoss}% 
  ❗️ A: ${static.avgStopLoss}% M:${static.maxStoploss}%(10x)
  🕰 <1h: ${static.h1} <4h: ${static.h4} <day: ${static.day} >day: ${static.days}
  ❤️ `;
  Object.keys(static.symbols).map((symbol) => {
    text += `${symbol}: ${static.symbols[symbol]}|`;
  });
  return text;
};
const buildPerformanceInfoMsg = async (uid) => {
  let data = await getPerformanceInfo(uid);
  let info = await findUidInfoOrCreate(uid);
  let text = `#INFO of *#${info.nickName.replace(/ |-/g, "_")}: ${
    info.followerCount
  } *[follower](${binanceProfileLeaderboardLink + uid}) \n\`${uid}\``;

  text += buildPNLandROI(data);
  logger.debug(text);
  return text;
};
const buildPNLandROI = (data) => {
  let text = ``;
  for (const [key, value] of Object.entries(data.PNL)) {
    //console.log(`${key}: ${value}`);
    if (value > 0) text += `\n${key}: ${value}$ (${data.ROI[key]}%)`;
    else text += `\n${key}: *${value}$ (${data.ROI[key]}%)*`;
  }

  return toEscapeMSg(text);
};

const toEscapeMSg = (str) => {
  return str.replace(/_/gi, `\\_`).replace(/-/gi, `\-`);
  // .replace("~", "\\~")
  // .replace(/`/gi, "\\`");
};

const getPerformanceInfo = async (uid) => {
  let data = await BinanceLeaderboardApi.getOtherPerformance(uid);
  let res = {
    ROI: {},
    PNL: {},
  };
  data.map((d) => {
    if (d.statisticsType == "ROI") {
      res.ROI[d.periodType] = (d.value * 100).toFixed(2);
    }
    if (d.statisticsType == "PNL") {
      //      if (res.PNL[d.periodType] > 0)
      res.PNL[d.periodType] = d.value.toFixed(2);
    }
  });
  return res;
};
const findGoodUId = async () => {};
const getTopLeaderBoard = async () => {};

module.exports = {
  buildPositionsMsg,
  buildStaticPositionMsg,
  buildPerformanceInfoMsg,
  getPerformanceInfo,
  getStaticOfRecentPosition,
  getCurrentPositionInfo,
};
