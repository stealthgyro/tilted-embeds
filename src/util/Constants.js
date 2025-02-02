// eslint-disable-next-line no-unused-vars
function keyMirror(arr) {
  const tmp = Object.create(null);
  for (const value of arr) tmp[value] = value;
  return tmp;
}

// eslint-disable-next-line no-unused-vars
function createEnum(keys) {
  const obj = {};
  for (const [index, key] of keys.entries()) {
    if (key === null) continue;
    obj[key] = index;
    obj[index] = key;
  }
  return obj;
}

// @ts-ignore
const Package = require("../../package.json");

const INVITE_URL = process.env.INVITE_URL || "https://adryd.co/twitter-embeds";

module.exports.USER_AGENT = `Mozilla/5.0 (compatible; ${Package.name}/${Package.version}; +${Package.homepage}; +${INVITE_URL}; Node.js/${process.version})`;
module.exports.GENERIC_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.0.0 Safari/537.36";

module.exports.TIKTOK_HOME = "https://www.tiktok.com";
module.exports.INSTAGRAM_HOME = "https://www.instagram.com";

module.exports.DEFAULT_SONG_SERVICES = {
  "amazonMusic":true,
  "amazonStore":false,
  "anghami":false,
  "boomplay":false,
  "appleMusic":true,
  "itunes":false,
  "napster":true,
  "pandora":false,
  "soundcloud":true,
  "spotify":true,
  "youtube":true,
  "youtubeMusic":true
};

//tilted, external, or off
module.exports.DEFAULT_MEDIA_SERVICES = {
  "facebook":'tilted',
  "instagram":'tilted',
  "reddit":'tilted',
  "tiktok":'off',
  "twitter":'https://vxtwitter.com/'
};

module.exports.EmbedModes = createEnum([null, "VIDEO_REPLY", "RE_EMBED", "RE_COMPOSE", "EXTERNAL"]);
module.exports.SAFEST_EMBED_MODE = this.EmbedModes.VIDEO_REPLY;

module.exports.QRT_UNROLL_BOTS = ["152172984373608449"];
module.exports.DELETE_EMOJIS = ["\u2716", "\u274E", "\u274C", "\u264D", "\u{1F6AB}"];

// I really don't give a shit if this is insecure or whatever, should be good enough to avoid collisions
module.exports.TEMP_DIR = `/tmp/${Package.name}_${Date.now()}_${process.pid}`;

module.exports.MAX_DISCORD_UPLOAD = 26214400;
module.exports.MAX_DISCORD_UPLOAD_TIER_2 = 52428800;
module.exports.MAX_DISCORD_UPLOAD_TIER_3 = 104857600;
module.exports.MAX_DISCORD_MESSAGE_LENGTH = 2000;

module.exports.Providers = keyMirror([
  "INSTAGRAM",
  "REDDIT",
  "REDDIT_VIDEO",
  "REDDIT_SLASH_S",
  "SONG_LINK",
  "TIKTOK",
  "TIKTOK_REDIRECT",
  "TWITTER",
  "X_DOT_COM"
]);

module.exports.URLRegexes = {
  INSTAGRAM: /https?:\/\/(?:www\.)?(instagram|facebook)\.com\/(?:p|tv|reels|reel|share\/r)\/[^/?#&]+/,
  REDDIT: /https?:\/\/(?:[^/]+\.)?reddit\.com(\/r\/[^/]+\/comments\/([^/?#&]+))/,
  REDDIT_VIDEO: /https?:\/\/v\.redd\.it\/([^/?#&]+)/,
  REDDIT_SLASH_S: /https?:\/\/(?:[^/]+\.)?reddit\.com(\/r\/[^/]+\/s\/([^/?#&\s]+))/,
  SONG_LINK: /(https?:\/\/(music\.(apple|youtube)\.com|open\.spotify\.com|spotify\.link)\/[^\s]+)/,
  TIKTOK: /https?:\/\/(?:www\.)?tiktok\.com\/@[0-9a-zA-Z._]+\/video\/(\d+)/,
  TIKTOK_REDIRECT: /https?:\/\/([a-z]{2,3})\.tiktok\.com\/(t\/)?([A-Za-z0-9]+)/,
  TWITTER: /https?:\/\/(?:(?:www|m(?:obile)?)\.)?(fx|vx)?twitter\.com\/(?:(?:i\/web|[^/]+)\/status|statuses)\/(\d+)/,
  X_DOT_COM: /https?:\/\/(?:(?:www|m(?:obile)?)\.)?()x\.com\/(?:(?:i\/web|[^/]+)\/status|statuses)\/(\d+)/
};

module.exports.Favicons = {
  INSTAGRAM: "https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png",
  REDDIT: "https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png",
  SONG_LINK: "https://odesli.co/favicon-16x16.png",
  TIKTOK: "https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png",
  TWITTER: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png"
};

module.exports.Colors = {
  INSTAGRAM: 0xe1306c,
  REDDIT: 0xff4500,
  SONG_LINK: 0xffffff,
  TWITTER: 0x1da1f2,
  TIKTOK: 0xee1d52
};