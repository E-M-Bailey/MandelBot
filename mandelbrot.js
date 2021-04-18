const Actions = require("./actions.js");
const Jimp = require("jimp");

module.exports = {
  execute: function(argv) {
    return parseArgs(argv);
  }
};

function parseArgs(argv) {
  let r = -.5;
  let i = 0.;
  let z = 250.;
  let d = 5;
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

  const helpMsg = Actions.message(`
!mandelbrot usage:
-? or --help: Display this message.
-r or --real: Set the real component of the center. Requires a real number argument. Default -0.5.
-i or --imaginary: Set the imaginary component of the center. Requires a real number argument. Default 0.
-z or --zoom: Set the zoom in pixels per unit. Requires a positive real number argument. Default 250.
-d or --dist: Set the distance from the origin considered divergence. Requires a real number >= 2. Default 5.
-w or --width: Set the width of the image. Requires a positive integer. Default 1920.
-h or --height: Set the height of the image. Requires a positive integer. Default 1080.
-t or --iterations: Set the number of iterations. Requires a nonnegative integer. Default 256.
`);
  function repMsg(opt) {
    return Actions.message(`Error (mandelbrot): repeated option ${opt}`);
  }
  function novMsg(opt) {
    return Actions.message(`Error (mandelbrot): option ${opt} has no value`);
  }
  function invMsg(opt) {
    return Actions.message(`Error (mandelbrot): option ${opt} has an invalid value!`);
  }
  function unkMsg(opt) {
    return Actions.message(`Error (mandelbrot): unknown option ${opt}`);
  }
// TODO implement --smooth
//-s or --smooth: Set whether the image is smooth. Requires true or false. Default false.

  for (let idx = 1; idx < argv.length; idx++) {
    let opt = argv[idx];
    switch(opt) {
      case "-?":
      case "--help":
        return [repMsg];

      case "-r":
      case "--real":
        if (rSpec) {
          return [repMsg(opt)];
        }
        rSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        r = parseFloat(argv[idx]);
        if (!isFinite(r)) {
          return [invMsg(opt)];
        }
        break;

      case "-i":
      case "--imaginary":
        if (iSpec) {
          return [repMsg(opt)];
        }
        iSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        i = parseFloat(argv[idx]);
        if (!isFinite(i)) {
          return [invMsg(opt)];
        }
        break;

      case "-z":
      case "--zoom":
        if (zSpec) {
          return [repMsg(opt)];
        }
        zSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        z = parseFloat(argv[idx]);
        if (!isFinite(z) || z <= 0) {
          return [invMsg(opt)];
        }
        break;

      case "-d":
      case "--dist":
        if (dSpec) {
          return [repMsg(opt)];
        }
        dSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        d = parseFloat(argv[idx]);
        if (!isFinite(d) || d < 2) {
          return [invMsg(opt)];
        }
        break;

      case "-w":
      case "--width":
        if (wSpec) {
          return [repMsg(opt)];
        }
        wSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        w = parseInt(argv[idx]);
        if (!isFinite(w) || w <= 0) {
          return [invMsg(opt)];
        }
        break;

      case "-h":
      case "--height":
        if (hSpec) {
          return [repMsg(opt)];
        }
        hSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        h = parseInt(argv[idx]);
        if (!isFinite(h) || h <= 0) {
          return [invMsg(opt)];
        }
        break;

      case "-t":
      case "--iterations":
        if (tSpec) {
          return [repMsg(opt)];
        }
        tSpec = true;
        idx++;
        if (idx >= argv.length) {
          return [novMsg(opt)];
        }
        t = parseInt(argv[idx]);
        if (!isFinite(t) || t < 0) {
          return [invMsg(opt)];
        }
        break;

      default:
        return [unkMsg(opt)];

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
    mkImg(filename, r, i, z, d, w, h, t, s);
    return [Actions.message("", [filename])];
  }
  catch (e) {
    return Actions.error(`Internal error (mandelbrot): ${e}`);
  }
}

function mkImg(filename, r, i, z, d, w, h, t, s) {
  let image = new Jimp(w, h, function(err, image) {
    if (err) {
      throw err;
    }
  });

  console.log("generating");
  generate(r, i, z, d, w, h, t, s, image);
  console.log("done\n");

  image.write(filename, function(err) {
    if (err) {
      throw err;
    }
  });

  return [Actions.message("", [filename])];
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

function generate(r, i, z, d, w, h, t, s, image) {
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
  let color;
  const LOG2 = Math.log(2);
  const LOG_LINES = true;
  if (LOG_LINES) {
    console.log(`0/${h}`);
  }
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
          if (mod2 >= d2) {
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
    if (LOG_LINES) {
      console.log(`${y + 1}/${h}`);
    }
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