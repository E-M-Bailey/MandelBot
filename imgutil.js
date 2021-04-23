const Fs = require("fs");

const Jimp = require("jimp");

const Actions = require("./actions.js");
const Interface = require("./interface.js");

class ImgUtil {
	static mkImg(w, h) {
		return new Jimp(w, h, function(err, image) {
			if (err) {
				console.trace(err);
				throw err;
			}
		});
	}

	static writeImg(filename, image, callback = function(err){}) {
		image.write(filename, function(err) {
			if (err) {
				console.trace(err);
			}
			callback(err);
		});
	}

	static readBin(binFile, w, h) {
		let image = this.mkImg(w, h);
		let data = Fs.readFileSync(binFile);
		let idx = 0;
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				let color = Jimp.rgbaToInt(
					data[idx],
					data[idx + 1],
					data[idx + 2],
					data[idx + 3]
				);
				image.setPixelColor(color, x, y);
				idx += 4;
			}
		}
		return image;
	}
}

module.exports = ImgUtil;
