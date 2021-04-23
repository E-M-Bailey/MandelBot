const Discord = require("discord.js");

const TRACE_ERR = true;

class Actions {

  static error(err) {
		return function(args) {
			args.channel.send(err);
			if (TRACE_ERR) {
				console.log("INTERNAL ERROR TRACE:");
				console.trace(err);
			}
			else {
				console.log(`INTERNAL ERROR:\n${err}\n`);
			}
		}
  }

  static message(text, files, embed, callback) {
		let sArgs = {};
		if (files) {
			sArgs.files = files;
		}
		if (embed) {
			sArgs.embed = embed;
		}
		if (callback) {
			return function(args) {
				args.channel.send(text, sArgs)
					.then(callback);
			};
		}
		else {
			return function(args) {
				args.channel.send(text, sArgs);
			};
		}
  }
};

module.exports = Actions;
