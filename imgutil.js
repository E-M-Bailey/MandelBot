const Jimp = require("jimp");

const Actions = require("./actions.js");

class ImgUtil {
	static mkImg(w, h) {
		return new Jimp(w, h, function(err, image) {
			if (err) {
				throw err;
			}
		});
	}

	static writeImg(filename, image) {
		image.write(filename, function(err) {
			if (err) {
				throw err;
			}
		});

		return [Actions.message("", [filename])];
	}

	static clamp(x, min, max) {
		return Math.min(max, Math.max(min, x));
	}

	static hsvaToHex(h, s, v, a) {
		h %= 1;
		h++;
		h %= 1;
		let c = v * s;
		let x = c * (1 - Math.abs(h * 6 % 2 - 1));
		let m = v - c;
		let r, g, b;
		switch (Math.floor(h * 6)) {
			case 0:
				r = c;
				g = x;
				b = 0;
				break;
			case 1:
				r = x;
				g = c;
				b = 0;
				break;
			case 2:
				r = 0;
				g = c;
				b = x;
				break;
			case 3:
				r = 0;
				g = x;
				b = c;
				break;
			case 4:
				r = x;
				g = 0;
				b = c;
				break;
			case 5:
				r = c;
				g = 0;
				b = x;
				break;
		}

		r = this.clamp(Math.floor((r + m) * 255), 0, 255);
		g = this.clamp(Math.floor((g + m) * 255), 0, 255);
		b = this.clamp(Math.floor((b + m) * 255), 0, 255);
		a = this.clamp(a * 255, 0, 255);
		let hex = Jimp.rgbaToInt(r, g, b, a);
		return hex;
	}
}

module.exports = ImgUtil;
