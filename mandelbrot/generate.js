const Jimp = require("jimp");

const ImgUtil = require("../imgutil.js");

class Generate {
	static mkImg(filename, w, h, args) {
		let image = ImgUtil.mkImg(w, h);

		console.log("generating");
		this.generate(args, image);
		console.log("done\n");

		return ImgUtil.writeImg(filename, image);
	}

	static generate(args, image) {
		let r = args.r;
		let i = args.i;
		let z = args.z;
		let d = args.d;
		let w = args.w;
		let h = args.h;
		let t = args.t;
		let s = args.s;
		let d2 = d * d;
		let zInv = 1 / z;
		let hw = w / 2;
		let hh = h / 2;
		let defCR = r - hw * zInv;
		let cr = defCR;
		let ci = i + hh * zInv;
		let compT = 0;
		let zr = 0;
		let zi = 0;
		let zr2 = 0;
		let zi2 = 0;
		let mod2;
		let diverges;
		const LOG2 = Math.log(2);
		const LOG_LINES = true;
		if (LOG_LINES) {
			console.log(`0/${h}`);
		}
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				if (this.inMainBulb(cr, ci)) {
					diverges = false;
				}
				else {
					while (true) {
						zi *= zr;
						zi += zi + ci;
						zr = zr2 - zi2 + cr;
						zr2 = zr * zr;
						zi2 = zi * zi;
						compT++;
						mod2 = zr2 + zi2;
						if (mod2 >= d2) {
							diverges = true;
							break;
						}
						if (compT > t) {
							diverges = false;
							break;
						}
					}
				}
				if (diverges) {
					zi *= zr;
					zi += zi + ci;
					zr = zr2 - zi2 + cr;
					zr2 = zr * zr;
					zi2 = zi * zi;
					zi += zi + ci;
					zr = zr2 - zi2 + cr;
					zr2 = zr * zr;
					zi2 = zi * zi;
					compT += 2;
					mod2 = zr2 + zi2;
					let mu = compT - Math.log(Math.log(mod2)) / LOG2 + 1;
					let shaded = ImgUtil.hsvaToHex(mu / 36, 1, 1, 1);
					image.setPixelColor(shaded, x, y);
				}
				else {
					image.setPixelColor(0x000000FF, x, y);
				}
				compT = 0;
				cr += zInv;
				zr = 0;
				zr2 = 0;
				zi = 0;
				zi2 = 0;
			}
			cr = defCR;
			ci -= zInv;
			if (LOG_LINES) {
				console.log(`${y + 1}/${h}`);
			}
		}
	}

	static inMainBulb(cr, ci) {
		let cr2 = cr * cr;
		let ci2 = ci * ci;
		let cm2 = cr2 + ci2;
		let cm = Math.sqrt(cm2);
		let cmInv = 1 / cm;
		let ur = cr * cmInv;
		let ui = ci * cmInv;
		let hui = ci * 0.5;
		let br = ur * 0.5 + hui * ui - 0.25;
		let bi = hui - ur * hui;
		if (cm2 <= br * br + bi * bi) {
			return true;
		}
		let icr = cr + 1;
		return icr * icr + ci * ci <= 0.0625;
	}
}

module.exports = Generate;
