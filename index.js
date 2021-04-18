const Discord = require("discord.js");
const Parser = require("./parser.js");
const client = new Discord.Client();

function onReady() {
  console.log(`Logged in as ${client.user.tag}!`);
}

function onMessage(msg) {
  if (msg.author != client.user) {
    let res = Parser.execute(msg.content);
    if (res !== undefined)
    {
      switch (res.type) {
        case "error":
          msg.channel.send(res.data);
          console.log(`ERROR:\n${res.data}`);
          break;
        case "text":
          msg.channel.send(res.data);
          break;
      }
    }
  }
}

client.on("ready", onReady);
client.on("message", onMessage);

client.login(process.env.TOKEN);
