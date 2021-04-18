const Actions = require("../actions.js");

const Generate = require("./generate.js");

class Mandelbrot {
	static execute(argv) {
		let r = -.5;
		let i = 0.;
		let z = 250.;
		let d = 500.;
		let w = 1920;
		let h = 1080;
		let t = 256;
		let s = false;
		
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
					return [this.helpMsg(opt)];

				case "-r":
				case "--real":
					if (rSpec) {
						return [this.repMsg(opt)];
					}
					rSpec = true;
					idx++;
					if (idx >= argv.length) {
						return [this.inovvMsg(opt)];
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
						return [this.inovvMsg(opt)];
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
						return [this.inovvMsg(opt)];
					}
					z = parseFloat(argv[idx]);
					if (!isFinite(z) || z <= 0) {
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
						return [this.inovvMsg(opt)];
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
						return [this.inovvMsg(opt)];
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
						return [this.inovvMsg(opt)];
					}
					h = parseInt(argv[idx]);
					if (!isFinite(h) || h <= 0) {
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
						return [this.inovvMsg(opt)];
					}
					t = parseInt(argv[idx]);
					if (!isFinite(t) || t < 0) {
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
			let filename = "mandelbrot.png";
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
			//console.log(JSON.stringify(Generate));
			Generate.mkImg(filename, w, h, args);
			return [Actions.message("", [filename])];
		}
		catch (e) {
			//tr = e.stack === undefined ? e : e.stack;
			try {
				console.trace(e);
			}
			catch (e1) {}
			return [Actions.error(`Internal error (mandelbrot): ${e}`)];
		}
	}

	static hlpMsg(opt) {
		return Actions.message(`
	!mandelbrot usage:
	-? or --help: Display this message.
	-r or --real: Set the real component of the center. Requires a real number argument. Default -0.5.
	-i or --imaginary: Set the imaginary component of the center. Requires a real number argument. Default 0.
	-z or --zoom: Set the zoom in pixels per unit. Requires a positive real number argument. Default 250.
	-d or --dist: Set the distance from the origin considered divergence. Requires a real number >= 2. Default 500.
	-w or --width: Set the width of the image. Requires a positive integer. Default 1920.
	-h or --height: Set the height of the image. Requires a positive integer. Default 1080.
	-t or --iterations: Set the number of iterations. Requires a nonnegative integer. Default 256.
	`);
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
}

module.exports = Mandelbrot;
