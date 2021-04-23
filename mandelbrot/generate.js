const Fs = require("fs");
const Path = require("path");

const ChildProcess = require("child_process");
const Discord = require("discord.js");

const Actions = require("../actions.js");
const Settings = require("./settings.js");
const Interface = require("../interface.js");
const Lexer = require("../lexer.js");
const ImgUtil = require("../imgutil.js");

class ResLexer extends Lexer {

  constructor(str) {
    super(str);
  }

  next() {
    this.skip(/\s/);
    if (this.curChar === undefined) {
      return undefined;
    }
    else if (/["']/.test(this.curChar)) {
      return this.quoted();
    }
    else {
      return this.unquoted();
    }
  }
}

const LOG_ROWS = true;

class Generate {

	static generate(filename, args, itfArgs) {

		let ls = ChildProcess.spawn(
			"./mandelbrot/generate",
			[
				filename,
				args.r.toString(),
				args.i.toString(),
				args.z.toString(),
				args.t.toString(),
				args.d.toString(),
				args.w.toString(),
				args.h.toString(),
			]
		);

		ls.on("error", function(code) {
			Interface.doAction(Actions.error(`INTERNAL ERROR: couldn't spawn mandelbrot/generate (code ${code})`), itfArgs);
		});

		ls.stdout.setEncoding("utf8");
		ls.stdout.on("data", this.acceptInput(filename, args, itfArgs));
	}

	static acceptInput(filename, args, itfArgs) {
		return function(data) {
			for (let msg of data.split("\n")) {
				try {
					let lexer = new ResLexer(msg);
					let lexRes = lexer.allTokens();
					let error = lexRes.error;
					let argv = lexRes.tokens;
					if (argv.length > 0) {
						switch (argv[0]) {
							case "row":
								if (error) {
									Interface.doAction(Actions.error(error), itfArgs);
								}
								else {
									Generate.doRow(argv, itfArgs);
								}
								break;
							case "prg":
								if (error) {
									Interface.doAction(Actions.error(error), itfArgs);
								}
								else {
									Generate.doPrg(argv, itfArgs);
								}
								break;
							case "done":
								if (error) {
									Interface.doAction(Actions.error(lexRes.error), itfArgs);
								}
								else {
									Generate.doDone(argv, args, filename, itfArgs);
								}
								break;
							case "log":
								for (let i = 1; i < argv.length; i++) {
									console.log(argv[i]);
								}
								break;
							default:
								console.log(argv[0]);
						}
					}
				}
				catch (e) {
					Interface.doAction(Actions.error(e), itfArgs);
				}
			}
		}
	}

	static doRow(argv, itfArgs) {
		console.log("row " + argv[1] + "/" + argv[2]);
	}

	static doPrg(argv, itfArgs) {
		console.log(`${argv[1]}%`);
	}

	static doDone(argv, args, filename, itfArgs) {
		let binFile = argv[1];
		let image = ImgUtil.readBin(binFile, args.w, args.h);
		Fs.unlink(binFile, function(err) {
			if (err) {
				Interface.doAction(Actions.error(err));
				return;
			}
			console.log("unlinked");
			let fname = `${filename}.png`;
			ImgUtil.writeImg(fname, image, function(err) {
				if (err) {
					Interface.doAction(Actions.error(err));
					return;
				}
				console.log("written");
				Fs.stat(`./${fname}`, function(err, stats) {
					if (err) {
						Interface.doAction(Actions.error(err));
						return;
					}
					Generate.sendReply(args, fname, stats.size, itfArgs);
				});	
			});
		});
	}

	static sendReply(args, fname, fsize, itfArgs) {
		let myAvatar = itfArgs.me.avatarURL();
		let aAvatar = itfArgs.author.avatarURL();
		let embed = {
			author: {
				name: itfArgs.member ? itfArgs.member.displayName : "",
				icon_url: aAvatar,
				url: itfArgs.message.url
			},
			title: "Mandelbrot Set",
			description: `Requested by ${itfArgs.author.toString()}`,
			fields: [
				{
					name: "Center",
					value: args.i >= 0 ? `${args.r} + ${args.i}i` : `${args.r} - ${-args.i}i`
				},
				{
					name: "Zoom",
					value: `${args.z}x`
				},
				{
					name: "Iterations",
					value: `${args.t}`
				},
				{
					name: "Escape Radius",
					value: `${args.d}`
				},
				{
					name: "Dimensions",
					value: `${args.w}x${args.h}`
				}
			],
			thumbnail: {
				url: myAvatar
			},
			image: {
				url: `attachment://${Path.basename(fname)}`
			},
			footer: {
				text: "m!mandelbrot",
				icon_url: myAvatar
			}
		};
		for (let arg in args) {
			let val = args[arg];
			if (val != Settings[arg]) {
				embed.footer.text += ` -${arg} ${val}`;
			}
		}
		if (fsize > 8000000) {
			Interface.doAction(Actions.error(`File size too large (${fsize})`), itfArgs);
		}
		Interface.doAction(Actions.message("", [fname], embed, Generate.addReactions(false)), itfArgs);
		//if (fsize < 8000000) {
		//	embed.image = {
		//		url: `attachment://${Path.basename(fname)}`
		//	};
		//	Interface.doAction(Actions.message("", [fname], embed), itfArgs);
		//}
		//else {
		//	embed.image = {
		//		url: `https://replit.com/@EMBailey/MandelBot#${fname}`
		//	};
		//	Interface.doAction(Actions.message("", [], embed), itfArgs);
		//}
	}

	static addReactions(isHelp) {
		let reactions = isHelp ? ["🗑️"] : ["🗑️", "⬆️", "↖️", "⬅️", "↙️", "⬇️", "↘️", "➡️", "↗️", "🔍", "🔭"];
		return async function(msg) {
			for (let reaction of reactions) {
				await msg.react(reaction);
			}
		}
	}
}

module.exports = Generate;
