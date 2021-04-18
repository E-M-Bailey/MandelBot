const Discord = require("discord.js");
const Parser = require("./parser.js");
const client = new Discord.Client();

const PATH = "https://replit.com/@EMBailey/MandelBot#"

function onReady() {
  console.log(`Logged in as ${client.user.tag}!`);
}

function onMessage(msg) {
  if (msg.author != client.user) {
    let res = Parser.execute(msg.content);
    if (res !== undefined)
    {
      let ch = msg.channel;
      switch (res.type) {
        case "error":
          ch.send(res.data);
          console.log(`ERROR:\n${res.data}`);
          break;
        case "text":
          ch.send(res.data);
          break;
        case "image":
          console.log(res.data);
          ch.send("", {files: [res.data]});
          break;
      }
    }
  }
}

client.on("ready", onReady);
client.on("message", onMessage);

client.login(process.env.TOKEN);
