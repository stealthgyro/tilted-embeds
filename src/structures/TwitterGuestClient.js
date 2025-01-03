const fetch = require("node-fetch");
// const ClientError = require("./ClientError");
const ClientError = require("./ClientError");
const GuildFlags = require("./GuildFlags");
const TwitterError = require("./TwitterError");
const TwitterErrorList = require("./TwitterErrorList");
const TwitterPost = require("./TwitterGuestPost");
const { USER_AGENT, EmbedModes } = require("../util/Constants");
const log = require("../util/log");

const TWITTER_GUEST_TOKEN =
  "Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw";
const GUEST_TOKEN_ENDPOINT = "https://api.twitter.com/1.1/guest/activate.json";
const TWEET_ENDPOINT = (tweetID) =>
  `https://api.twitter.com/2/timeline/conversation/${tweetID}.json?tweet_mode=extended&include_user_entities=1`;

// https://github.com/ytdl-org/youtube-dl/blob/master/youtube_dl/extractor/twitter.py
class TwitterGuestClient {
  getSetting(options, match){
    const dbOptions = options;
    let mediaServiceObj = {};
    if(dbOptions && dbOptions.serviceSettings){
      mediaServiceObj = JSON.parse(dbOptions.serviceSettings)
    }else{
      mediaServiceObj = DEFAULT_MEDIA_SERVICES;
    }
    var urlMatch = match[0];
    log.verbose("TwitterGuestClient(getSetting)", `Got urlMatch: ${urlMatch}`);
    try{
      return mediaServiceObj.twitter; // {tilted, external, off}
    }catch(ignored){
      log.error("TwitterGuestClient", ignored);
    }
    return;
  }
  _fetchGuestToken() {
    return fetch(GUEST_TOKEN_ENDPOINT, {
      method: "post",
      headers: {
        "user-agent": USER_AGENT,
        authorization: TWITTER_GUEST_TOKEN
      }
    }).then((res) => res.json());
  }

  async _getGuestToken() {
    if (!this.guestToken || this.guestTokenAge - Date.now() > 10740000) {
      log.info("TwitterGuestClient", "Renewing guest token");
      const data = await this._fetchGuestToken();
      this.guestTokenAge = Date.now();
      this.guestToken = data["guest_token"];
    }
    return this.guestToken;
  }

  // TODO: Renew client token when errors
  // eslint-disable-next-line no-unused-vars
  async getPost(match, options, isRetry = false) {
    log.verbose("TwitterGuestClient", "getPost: match: " + match);
    const id = match[2];
    const twitfix = match[1];
    if (!options.flags.has(GuildFlags.Flags.PARSE_TWITFIX) && twitfix === "fx") return null;
    if (twitfix === "fx" && options.mode === EmbedModes.VIDEO_REPLY) return null;
    return fetch(TWEET_ENDPOINT(id), {
      headers: {
        "user-agent": USER_AGENT,
        authorization: TWITTER_GUEST_TOKEN,
        "x-guest-token": await this._getGuestToken()
      }
    })
      .then((res) => res.text())
      .then((res) => {
        let parsed;
        try {
          log.verbose("TwitterGuestClient", "res: \n" + res);
          parsed = JSON.parse(res);
        } catch (error) {
          throw new ClientError("Error parsing JSON", "Twitter");
        }
        if (parsed.errors) {
          if (parsed.errors.filter((error) => error.code === 239) && !isRetry) {
            log.info("TwitterGuestClient", "Renewing Twitter guest token");
            this.guestToken = null;
            return this.getPost(match, options, true);
          }
          throw new TwitterErrorList(parsed.errors.map((err) => new TwitterError(err)));
        }
        return parsed;
      })
      .then((conversation) => {
        if (!conversation?.globalObjects?.tweets) {
          throw new ClientError(`Didn't recieve conversation data; ID:${id}`, "Twitter");
        }
        const tweets = conversation.globalObjects.tweets;
        log.verbose("TwitterGuestClient", "tweets: \n" + JSON.stringify(tweets, null, 2));
        if (!tweets[id]) {
          throw new ClientError(`Didn't recieve tweet data; ID:${id}`, "Twitter");
        }
        const tweetIndex = tweets[id].retweeted_status_id_str ?? id;
        const tweet = new TwitterPost(tweets[tweetIndex]);
        tweet.addUserData(conversation.globalObjects.users[tweet.userID]);
        if (!tweet.videoUrl) return null;
        return tweet;
      });
  }
}

module.exports = new TwitterGuestClient();
