const Actions = require("../actions.js");
const Settings = require("./settings.js");
const Generate = require("./generate.js");

// TODO add request limits
// TODO add a request queue
// TODO add a progress bar
// TODO add per-guild, per-channel, per-user data storage

class Mandelbrot {
	static execute(argv, itfArgs) {
		let r = Settings.r;
		let i = Settings.i;
		let z = Settings.z;
		let d = Settings.d;
		let w = Settings.w;
		let h = Settings.h;
		let t = Settings.t;
		let s = Settings.s;
		
		let rSpec = false;
		let iSpec = false;
		let zSpec = false;
		let dSpec = false;
		let wSpec = false;
		let hSpec = false;
		let tSpec = false;
		//let sSpec = false;

	// TODO implement --smooth
	//-s or --smooth: Set whether the image is smooth. Requires true or false. Default false.

		for (let idx = 1; idx < argv.length; idx++) {
			let opt = argv[idx];
			switch(opt) {
				case "-?":
				case "--help":
					return [this.hlpMsg(opt, itfArgs)];

				case "-r":
				case "--real":
					if (rSpec) {
						return [this.repMsg(opt)];
					}
					rSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novMsg(opt)];
					}
					r = parseFloat(argv[idx]);
					if (!isFinite(r)) {
						return [this.invMsg(opt)];
					}
					break;

				case "-i":
				case "--imaginary":
					if (iSpec) {
						return [this.repMsg(opt)];
					}
					iSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novMsg(opt)];
					}
					i = parseFloat(argv[idx]);
					if (!isFinite(i)) {
						return [this.invMsg(opt)];
					}
					break;

				case "-z":
				case "--zoom":
					if (zSpec) {
						return [this.repMsg(opt)];
					}
					zSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novMsg(opt)];
					}
					z = parseFloat(argv[idx]);
					if (!isFinite(z) || z <= 0) {
						return [this.invMsg(opt)];
					}
					break;

				case "-t":
				case "--iterations":
					if (tSpec) {
						return [this.repMsg(opt)];
					}
					tSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novMsg(opt)];
					}
					t = parseInt(argv[idx]);
					if (!isFinite(t) || t < 0) {
						return [this.invMsg(opt)];
					}
					break;

				case "-d":
				case "--dist":
					if (dSpec) {
						return [this.repMsg(opt)];
					}
					dSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novmMsg(opt)];
					}
					d = parseFloat(argv[idx]);
					if (!isFinite(d) || d < 2) {
						return [this.invMsg(opt)];
					}
					break;

				case "-w":
				case "--width":
					if (wSpec) {
						return [this.repMsg(opt)];
					}
					wSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novMsg(opt)];
					}
					w = parseInt(argv[idx]);
					if (!isFinite(w) || w <= 0) {
						return [this.invMsg(opt)];
					}
					break;

				case "-h":
				case "--height":
					if (hSpec) {
						return [this.repMsg(opt)];
					}
					hSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.novMsg(opt)];
					}
					h = parseInt(argv[idx]);
					if (!isFinite(h) || h <= 0) {
						return [this.invMsg(opt)];
					}
					break;

				default:
					return [this.unkMsg(opt)];

				//case "-s":
				//case "--smooth":
				//  if (sSpec) {
				//    return {
				//      type: "error",
				//      data: "Error (mandelbrot): repeated option -s!"
				//    };
				//  }
				//  sSpec = true;
				//  idx++;
				//  if (idx >= argv.length) {
				//    return {
				//      type: "error",
				//      data: "Error (mandelbrot): option -s has no value!"
				//    };
				//  }
				//  s = parseBool(argv[idx]);
				//  if (s === undefined) {
				//    return {
				//      type: "error",
				//      data: "Error (mandelbrot): option -s has an invalid //value!"
				//    }
				//  }
				//  break;
			}
		}
		try {
			if (w * h > Settings.MAX_SIZE) {
				return [this.sizMsg(w * h)];
			}
			if (w * h * t > Settings.MAX_COST) {
				return [this.cstMsg(w * h * t)];
			}
			let filename = "mandelbrot/img/" + Math.floor(Math.random() * 1073741824);
			let args = {
				r: r,
				i: i,
				z: z,
				d: d,
				w: w,
				h: h,
				t: t,
				s: s
			};
			Generate.generate(filename, args, itfArgs);
		}
		catch (e) {
			try {
				console.trace(e);
			}
			catch (e1) {}
			return [Actions.error(`Internal error (mandelbrot): ${e}`)];
		}
	}

	static hlpMsg(opt, itfArgs) {
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//^ 2 shorter than max line length
		let helpText =
`\`\`\`
Description: Displays this message.
  Arguments: None
Constraints: None
   Defaults: None
\`\`\``;
		let realText =
`\`\`\`
Description: The center real component.
  Arguments: A real number
Constraints: None
   Defaults: ${Settings.r.toLocaleString()}
\`\`\``;
		let imaginaryText =
`\`\`\`
Description: The center imaginary component.
  Arguments: A real number
Constraints: None
   Defaults: ${Settings.i.toLocaleString()}
\`\`\``;
		let zoomText =
`\`\`\`
Description: The zoom level of the image in
             image sizes per unit. Image size
             is defined as the geometric
             mean of width and height.
  Arguments: A real number
Constraints: Must be greater than zero
   Defaults: ${Settings.z.toLocaleString()}
\`\`\``;
		let iterationsText =
`\`\`\`
Description: The number of iterations.
  Arguments: An integer
Constraints: Must be greater than zero
   Defaults: ${Settings.t.toLocaleString()}
\`\`\``;
		let distText =
`\`\`\`
Description: The escape radius.
  Arguments: A real number
Constraints: Must be at least two
   Defaults: ${Settings.d.toLocaleString()}
\`\`\``;
		let widthText =
`\`\`\`
Description: The image width.
  Arguments: An integer
Constraints: Must be greater than zero
   Defaults: ${Settings.w.toLocaleString()}
\`\`\``;
		let heightText =
`\`\`\`
Description: The image height.
  Arguments: An integer
Constraints: Must be greater than zero
   Defaults: ${Settings.h.toLocaleString()}
\`\`\``;
		let constraintsText =
`\`\`\`
    w * h ≤ ${Settings.MAX_SIZE.toLocaleString()}
t * w * h ≤ ${Settings.MAX_COST.toLocaleString()}
\`\`\``;
//		let helpTxt =
//`
//-? or --help: Display this message.
//
//-r or --real: Set the real component of the center. Requires a real number argument. Default ${Settings.r}.
//
//-i or --imaginary: Set the imaginary component of the center. Requires a real number argument. Default $//{Settings.i}.
//
//-z or --zoom: Set the zoom in image diagonals per unit. The image size here is the geometric mean of the width and the height. Requires a positive real number argument. //Default ${Settings.z}.
//
//-t or --iterations: Set the number of iterations. Requires a nonnegative integer. Default ${Settings.t}.
//
//-d or --dist: Set the distance from the origin considered //divergence. Requires a real number >= 2. Default $//{Settings.d}.
//
//-w or --width: Set the width of the image. Requires a positive integer. Default ${Settings.w}.
//
//-h or --height: Set the height of the image. Requires a positive integer. Default ${Settings.h}.
//
//The image should have at most ${Settings.MAX_SIZE} pixels.
//
//The image's cost (which is defined as the product of width, height and iterations) may be at most $//{Settings.MAX_COST}.
//`;
	let myAvatar = itfArgs.me.avatarURL();
	let aAvatar = itfArgs.author.avatarURL();
	let embed = {
			author: {
				name: itfArgs.member ? itfArgs.member.displayName : "",
				icon_url: aAvatar,
				url: itfArgs.message.url
			},
			title: "Mandelbrot Set Help",
			description: `Requested by ${itfArgs.author.toString()}`,
			fields: [
				{
					name: "-? or --help",
					value: helpText
				},
				{
					name: "-r or --real",
					value: realText
				},
				{
					name: "-i or --imaginary",
					value: imaginaryText
				},
				{
					name: "-z or --zoom",
					value: zoomText
				},
				{
					name: "-t or --iterations",
					value: iterationsText
				},
				{
					name: "-d or --dist",
					value: distText
				},
				{
					name: "-w or --width",
					value: widthText
				},
				{
					name: "-h or --height",
					value: heightText
				},
				{
					name: "Extra Constraints",
					value: constraintsText
				}
			],
			thumbnail: {
				url: myAvatar
			},
			footer: {
				text: "m!mandelbrot -?",
				icon_url: myAvatar
			}
		};
		return Actions.message("", [], embed, Generate.addReactions(true));
	}

	static repMsg(opt) {
		return Actions.message(`Error (mandelbrot): repeated option ${opt}`);
	}
	
	static novMsg(opt) {
		return Actions.message(`Error (mandelbrot): option ${opt} has no value`);
	}

	static invMsg(opt) {
		return Actions.message(`Error (mandelbrot): option ${opt} has an invalid value!`);
	}

	static unkMsg(opt) {
		return Actions.message(`Error (mandelbrot): unknown option ${opt}`);
	}

	static sizMsg(size) {
		return Actions.message(`Error (mandelbrot): image has ${size} pixels; it should have at most ${this.MAX_SIZE}`);
	}

	static cstMsg(cost) {
		return Actions.message(`Error (mandelbrot): image has a cost of ${cost}; cost should be at most ${this.MAX_COST}`);
	}
}

module.exports = Mandelbrot;
