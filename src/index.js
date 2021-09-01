const fs = require("fs");
const { TextChannel } = require("discord.js");
const modeCommand = require("./commands/embedmode");
const { database } = require("./database");
const discord = require("./discord");
const messageCreate = require("./events/messageCreate");
const messageReactionAdd = require("./events/messageReactionAdd");
const reEmbed = require("./handlers/reEmbed");
const GuildOptions = require("./structures/GuildOptions");
const interactionHandler = require("./structures/InteractionHandler");
const { TEMP_DIR, EmbedModes } = require("./util/Constants");
const log = require("./util/log");

let logChannel;

discord.on("messageCreate", messageCreate);
discord.on("messageReactionAdd", messageReactionAdd);
discord.on("interactionCreate", (intercation) => interactionHandler.handle(intercation));

discord.on("guildCreate", (guild) => {
  if (logChannel) {
    const safeName = guild.name.replace(/(@everyone|@here|<|>)/g, "\\$&");
    logChannel.send(`:tada: New guild: ${guild.memberCount} members; ${guild.id}:${safeName}`);
  }
  // Most popular mode, even though my poor bandwidth hates it ;-;
  if (guild.me.permissions.has(reEmbed.REQUIRED_PERMISSIONS)) {
    GuildOptions.setOptions(guild.id, { mode: EmbedModes.RE_EMBED });
  }
});

discord.on("guildDelete", (guild) => {
  if (logChannel) {
    const safeName = guild.name.replace(/(@everyone|@here|<|>)/g, "\\$&");
    logChannel.send(`:cry: Gone guild: ${guild.id}:${safeName}`);
  }
});

discord.on("ready", () => {
  log.info("index", `Ready! logged in as ${discord.user.username}`);
  discord.user.setPresence({
    status: "online",
    activities: [{ name: process.env.STATUS ?? "adryd.co/twitter-embeds", type: 0 }]
  });
  // @ts-ignore
  const channel = discord.channels.cache.get(process.env.LOG_CHANNEL);
  if (channel instanceof TextChannel) {
    logChannel = channel;
    module.exports.logChannel = logChannel;
    logChannel.send("Ready!");
  }
});

discord.on("debug", (data) => {
  log.silly("discord", data);
});

interactionHandler.registerCommand(modeCommand);

process.on("SIGINT", () => {
  log.info("Cleanly exiting...");
  discord.destroy();
});

(async function init() {
  await fs.promises.mkdir(TEMP_DIR);
  await database.sync();
  await discord.login(process.env.TOKEN);
})();
