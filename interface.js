const Discord = require("discord.js");

class Interface {
	static client = new Discord.Client();

	static doAction(action, args) {
		if (action !== undefined) {
			try {
				action(args);
			}
			catch (e) {
				console.log("ERROR:\n");
				console.trace(e);
				try {
					args.channel.send(`INTERNAL ERROR: ${e}`);
				}
				catch (e1) {
					console.log("ERROR SENDING ERROR:\n");
					console.trace(e1);
				}
			}
		}
	}

	static doActions(actions = [], args) {
		for (let action of actions) {
			this.doAction(action, args);
		}
	}
}

module.exports = Interface;
