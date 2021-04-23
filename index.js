const Discord = require("discord.js");

const Interface = require("./interface.js");
const Exec = require("./exec.js");

var procUsers = {};

function onReady() {
	console.log(`Logged in as ${Interface.client.user.tag}!`);
}

function onMessage(msg) {
	if (msg.author != Interface.client.user) {
		
		let itfArgs = {
			me: Interface.client.user,
			client: Interface.client,
			message: msg,
			author: msg.author,
			channel: msg.channel,
			guild: msg.channel.guild,
			member: msg.channel.guild.member(msg.author)
		};
		Interface.doActions(Exec.execute(msg.content, itfArgs), itfArgs);
	}
}

Interface.client.on("ready", onReady);
Interface.client.on("message", onMessage);

Interface.client.login(process.env.TOKEN);
