const got = require("got");

const BASE_API = "https://www.binance.com/bapi/futures/v1/";

module.exports = {
  tradeType: "PERPETUAL",
  init(config) {
    this.tradeType = config.tradeType;
  },
  async getPrice() {
    const url = BASE_API + "public/future/leaderboard/getOtherPosition";
    const payload = {
      json: {
        encryptedUid: this.encryptedUid,
        tradeType: this.tradeType,
      },
    };
    const { data } = await got.post(url, payload).json();
    return data;
  },
  async getOtherPosition(encryptedUid, tradeType = this.tradeType) {
    try {
      const url = BASE_API + "public/future/leaderboard/getOtherPosition";
      const payload = {
        json: {
          encryptedUid: encryptedUid,
          tradeType: tradeType,
        },
      };
      const { data } = await got.post(url, payload).json();
      return data;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        otherPositionRetList: [],
      };
    }
  },
  async getLeaderboardRank(periodType = "MONTHLY", statisticsType = "ROI") {
    try {
      const url =
        "https://www.binance.com/bapi/futures/v2/public/future/leaderboard/getLeaderboardRank";
      const payload = {
        json: {
          isShared: true,
          periodType: periodType,
          statisticsType: statisticsType,
          tradeType: this.tradeType,
          limit: 100,
        },
      };
      const { data } = await got.post(url, payload).json();
      return data;
    } catch (error) {
      console.log(`error: `, error);
      return [];
    }
  },
  async getOtherPerformance(encryptedUid) {
    try {
      const url = BASE_API + "public/future/leaderboard/getOtherPerformance";
      let payload = {
        json: {
          encryptedUid: encryptedUid,
          tradeType: this.tradeType,
        },
      };
      const { data } = await got.post(url, payload).json();

      return data;
    } catch (error) {
      console.log(`error: `, error);
      return [];
    }
  },
  async getOtherLeaderboardBaseInfo(encryptedUid) {
    try {
      const url =
        BASE_API + "public/future/leaderboard/getOtherLeaderboardBaseInfo";
      let payload = {
        json: {
          encryptedUid: encryptedUid,
          tradeType: this.tradeType,
        },
      };
      const { data } = await got.post(url, payload).json();

      return data;
    } catch (error) {
      console.log(`error: `, error);
      return [];
    }
  },
  async searchLeaderboard(
    periodType = "EXACT_YEARLY",
    pnlGainType = "LEVEL5",
    sortType = "ROI"
  ) {
    try {
      const url = BASE_API + "public/future/leaderboard/searchLeaderboard";
      let payload = {
        json: {
          isShared: true,
          tradeType: this.tradeType,
          periodType: periodType,
          pnlGainType: pnlGainType,
          type: "filterResults",
          sortType: sortType,
          limit: "200",
        },
      };
      const { data } = await got.post(url, payload).json();

      return data;
    } catch (error) {
      console.log(`error: `, error);
      return [];
    }
  },
  async getRecentPosition(encryptedUid) {
    try {
      let url =
        "https://backend.copyfuture.me/binance/leaderboard/get-user-positions?encUserId=";
      url += encryptedUid;
      const data = await got(url).json();

      return data;
    } catch (error) {
      console.log(`error: `, error);
      return [];
    }
  },
};
