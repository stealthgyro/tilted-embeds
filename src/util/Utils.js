const { exec } = require("child_process");
const { PermissionFlagsBits, DiscordAPIError, BaseGuildTextChannel } = require("discord.js");
const { MAX_DISCORD_UPLOAD, MAX_DISCORD_UPLOAD_TIER_2, MAX_DISCORD_UPLOAD_TIER_3 } = require("./Constants");
const log = require("./log");
const discord = require("../discord");

// Cannot reply to messages without READ_MESSAGE_HISTORY
function safeReply(message, newMessage) {
  try {
    if (
      message.channel instanceof BaseGuildTextChannel &&
      !message.channel.permissionsFor(discord.user.id).has(PermissionFlagsBits.ReadMessageHistory)
    ) {
      if (message.channel.permissionsFor(discord.user.id).has(PermissionFlagsBits.SendMessages)) {
        return message.channel.send(newMessage);
      }
    } else {
      return message.reply(newMessage);
    }
  } catch (exception) {
    if (exception instanceof DiscordAPIError) {
      log.error(exception);
      return;
    }
    throw exception;
  }
}

function notifyPermissions(message, permissions, mode) {
  const reply = safeReply(
    message,
    // eslint-disable-next-line prettier/prettier
    `For the bot to use ${mode} mode, it needs the following permissions: ${permissions
      .toArray()
      .join(
        ", "
      )}. An administrator can switch mode using /embedmode or grant the required permissions in server settings. This message will self-destruct in 30 seconds.`
  );
  setTimeout(async () => {
    if (reply != undefined) {
      reply.then((replyResolved) => {
        try {
          replyResolved.delete();
        } catch (error) {
          if (error instanceof DiscordAPIError) {
            return;
          }
        }
      });
    }
  }, 30 * 1000);
  return message;
}

function tempMsg(channel, message) {
  const newMessage = channel.send(message);
  setTimeout(async () => {
    newMessage.then((replyResolved) => {
      try {
        replyResolved.delete();
      } catch (error) {
        if (error instanceof DiscordAPIError) {
          return;
        }
      }
    });
  }, 30 * 1000);
  return newMessage;
}

// https://stackoverflow.com/a/39243641
// https://gitlab.com/Cynosphere/HiddenPhox/-/blob/rewrite/src/lib/utils.js#L303-335
// Thank you Cyn!
const htmlEntities = {
  nbsp: " ",
  cent: "¢",
  pound: "£",
  yen: "¥",
  euro: "€",
  copy: "©",
  reg: "®",
  lt: "<",
  gt: ">",
  quot: '"',
  amp: "&",
  apos: "'"
};

function parseHtmlEntities(str) {
  return str.replace(/&([^;]+);/g, function (entity, entityCode) {
    var match;

    if (entityCode in htmlEntities) {
      return htmlEntities[entityCode];
    } else if ((match = entityCode.match(/^#x([\da-fA-F]+)$/))) {
      return String.fromCharCode(parseInt(match[1], 16));
    } else if ((match = entityCode.match(/^#(\d+)$/))) {
      return String.fromCharCode(~~match[1]);
    } else {
      return entity;
    }
  });
}

function sh(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
}

function getUploadLimit(guild) {
  if (!guild) return MAX_DISCORD_UPLOAD;

  if (guild.premiumTier == 2) return MAX_DISCORD_UPLOAD_TIER_2;

  if (guild.premiumTier == 3) return MAX_DISCORD_UPLOAD_TIER_3;

  return MAX_DISCORD_UPLOAD;
}

module.exports = {
  safeReply,
  notifyPermissions,
  parseHtmlEntities,
  tempMsg,
  sh,
  getUploadLimit
};
