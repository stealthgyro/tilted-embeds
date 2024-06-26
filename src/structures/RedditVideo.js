const fetch = require("node-fetch");
const cookiefile = require('cookiefile');
const ClientError = require("./ClientError");
const RedditClient = require("./RedditClient");
const { GENERIC_USER_AGENT } = require("../util/Constants");
const log = require("../util/log");

module.exports.getPost = function getPost(match) {
  const cookiemap = new cookiefile.CookieMap('./data/cookies.txt');
  const cookies = cookiemap.toRequestHeader().replace('Cookie: ','');
  const url = match[0];
  log.verbose("RedditVideo", `url ${url}`);
  return fetch(url, {
    method: "HEAD", // *GET, POST, PUT, DELETE, HEAD, etc.
    credentials: "include", // include, *same-origin, omit
    headers: {
        "User-Agent": GENERIC_USER_AGENT,
        "Cookie": cookies
    },
    redirect: "follow"
  }).then((response) => {
    if (response.status === 301 || response.status === 302) {
      const locationURL = new URL(response.headers.get("location"), response.url);
      var urlObj = new URL(locationURL);
      var cleanUrl = urlObj.href.replace(urlObj.search, "");
      return RedditClient.getPost([cleanUrl, urlObj.pathname]);
    }
    if (response.status !== 200) {
      throw new ClientError(`HTTP ${response.status} while fetching post`, "Reddit");
    }
    if (response.status == 200 || response.status == 201) {
      var urlObj = new URL(response.url);
      var cleanUrl = urlObj.href.replace(urlObj.search, "");
      // Replicate what a match from our regex would look like without executing the regex
      return RedditClient.getPost([cleanUrl, urlObj.pathname]);
    }    
  });
};
