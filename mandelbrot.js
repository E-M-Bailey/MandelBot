const Jimp = require("jimp");

module.exports = {
  execute: function(argv) {
    return parseArgs(argv);
  }
};

function parseArgs(argv) {
  let r = .0, i = .0;
  let z = 256.;
  let w = 1920, h = 1080;
  let t = 256;
  let s = false;
  
  let rSpec = false, iSpec = false;
  let zSpec = false;
  let wSpec = false, hSpec = false;
  let tSpec = false;
  let sSpec = false;

  let helpStr = `
!mandelbrot usage:
-? or --help: Display this message.
-r or --real: Set the real component of the center. Requires a real number argument. Default 0.
-i or --imaginary: Set the imaginary component of the center. Requires a real number argument. Default 0.
-z or --zoom: Set the zoom in pixels per unit. Requires a positive real number argument. Default 256.
-w or --width: Set the width of the image. Requires a positive integer. Default 1920.
-h or --height: Set the height of the image. Requires a positive integer. Default 1080.
-t or --iterations: Set the number of iterations. Requires a nonnegative integer. Default 256.
-s or --smooth: Set whether the image is smooth. Requires true or false. Default false.
`;

  for (let idx = 1; idx < argv.length; idx++) {
    switch(argv[idx]) {
      case "-?":
      case "--help":
        return {
          type: "text",
          data: helpStr
        };

      case "-r":
      case "--real":
        if (rSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -r!"
          };
        }
        rSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -r has no value!"
          };
        }
        r = parseFloat(argv[idx]);
        if (!isFinite(r)) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -r has an invalid value!"
          }
        }
        break;

      case "-i":
      case "--imaginary":
        if (iSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -i!"
          };
        }
        iSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -i has no value!"
          };
        }
        i = parseFloat(argv[idx]);
        if (!isFinite(i)) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -i has an invalid value!"
          }
        }
        break;

      case "-z":
      case "--zoom":
        if (zSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -z!"
          };
        }
        zSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -z has no value!"
          };
        }
        z = parseFloat(argv[idx]);
        if (!isFinite(z) || z <= 0) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -z has an invalid value!"
          }
        }
        break;

      case "-w":
      case "--width":
        if (wSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -w!"
          };
        }
        wSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -w has no value!"
          };
        }
        w = parseInt(argv[idx]);
        if (!isFinite(w) || w <= 0) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -w has an invalid value!"
          }
        }
        break;

      case "-h":
      case "--height":
        if (hSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -h!"
          };
        }
        hSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -h has no value!"
          };
        }
        h = parseInt(argv[idx]);
        if (!isFinite(h) || h <= 0) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -h has an invalid value!"
          }
        }
        break;

      case "-t":
      case "--iterations":
        if (tSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -t!"
          };
        }
        tSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -t has no value!"
          };
        }
        t = parseInt(argv[idx]);
        if (!isFinite(t) || t < 0) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -t has an invalid value!"
          }
        }
        break;

      case "-s":
      case "--smooth":
        if (sSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -s!"
          };
        }
        sSpec = true;
        idx++;
        if (idx >= argv.length) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -s has no value!"
          };
        }
        s = parseBool(argv[idx]);
        if (s === undefined) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -s has an invalid value!"
          }
        }
        break;
    }
  }
  try {
    return mkImg(r, i, z, w, h, t, s);
  }
  catch (e) {
    return {
      type: "error",
      data: `Error (mandelbrot): ${e}`
    };
  }
}

function mkImg(r, i, z, w, h, t, s) {
  let filename = "test.png";
  let image = new Jimp(w, h, function(err, image) {
    if (err) {
      throw err;
    }
  });

  generate(r, i, z, w, h, t, s, image);

  //for (let x = 0; x < w; x++) {
  //  for (let y = 0; y < h; y++) {
  //    if (x > y) {
  //      image.setPixelColor(generate(r, i, z, w, h, y, s, x, y), x, y);
  //    }
  //  }
  //}

  image.write(filename, function(err) {
    if (err) {
      throw err;
    }
  });

  return {
    type: "image",
    data: filename
  };
}

function clamp(x, min, max) {
  return Math.min(max, Math.max(min, x));
}

function hsvaToHex(h, s, v, a) {
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

  r = clamp(Math.floor((r + m) * 255), 0, 255);
  g = clamp(Math.floor((g + m) * 255), 0, 255);
  b = clamp(Math.floor((b + m) * 255), 0, 255);
  a = clamp(a * 255, 0, 255);
  let hex = Jimp.rgbaToInt(r, g, b, a);
  //console.log(`${r}, ${g}, ${b}, ${a}`);
  return hex;
}

function generate(r, i, z, w, h, t, s, image) {
  console.log("generating");
  let zInv = 1 / z;
  let hw = w / 2;
  let hh = h / 2;
  let defCR = r - hh * zInv;
  let cr = defCR;
  let ci = i + hh * zInv;
  let compT = 0;
  let zr = 0;
  let zi = 0;
  let zr2 = 0;
  let zi2 = 0;
  let mod2;
  let color;
  const LOG2 = Math.log(2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (inMainBulb(cr, ci)) {
        color = false;
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
          if (mod2 > 25) {
            color = true;
            break;
          }
          if (compT > t) {
            color = false;
            break;
          }
        }
      }
      if (color) {
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
        let shaded = hsvaToHex(mu / 36, 1, 1, 1);
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
  }
}

function inMainBulb(cr, ci) {
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