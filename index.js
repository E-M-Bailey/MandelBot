const Discord = require("discord.js");
const Exec = require("./exec.js");

const client = new Discord.Client();

function onReady() {
	console.log(`Logged in as ${client.user.tag}!`);
}

function onMessage(msg) {
	if (msg.author != client.user) {
		let res = Exec.execute(msg.content);
		if (res !== undefined) {
			let ch = msg.channel;
			//console.log(JSON.stringify(res));
			for (action of res) {
				if (action !== undefined) {
					try {
						//console.log(JSON.stringify(action));
						let data = action.data;
						switch (action.type) {
							case "error":
								ch.send(data);
								console.log(`ERROR:\n${data}`);
								break;
							case "message":
								ch.send(data.text, { files: data.files });
						}
					}
					catch (e) {
						try {
							ch.send(`Internal Error: ${e}`);
						}
						catch (e1) {
							console.log(`ERROR SENDING ERROR:\n${e1}`);
						}
						finally {
							console.log(`ERROR:\n${e}`);
						}
					}
				}
			}
		}
	}
}

client.on("ready", onReady);
client.on("message", onMessage);

client.login(process.env.TOKEN);
