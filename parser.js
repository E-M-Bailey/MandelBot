module.exports = {
  execute: function(msg) {
    lexer = new ArgsLexer(msg);
    let lexRes = lexer.allTokens();
    let isErr = lexRes.error !== undefined;
    let err = {
      type: "error",
      data: e
    };
    let argv = lexRes.tokens;
    if (argv.length > 0) {
      switch (argv[0]) {
        case "!mandelbrot": return isErr ? err : doMandelbrot(argv);
        
      }
    }
    return undefined;
    console.log("done");
  }
}

function doMandelbrot(argv) {
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

  for (let idx = 1; idx < argv.length(); idx++) {
    switch(argv[idx]) {
      case "-r":
      case "--real":
        if (rSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -r!";
          };
        }
        rSpec = true;
        idx++;
        if (idx >= argv.length()) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -r has no value!";
          };
        }
        r = parseFloat(argv[idx]);
        if (!isFinite(r)) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -r has an invalid value!";
          }
        }
        break;
      case "-i";
      case "--imaginary":
        if (iSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -i!";
          };
        }
        iSpec = true;
        idx++;
        if (idx >= argv.length()) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -i has no value!";
          };
        }
        i = parseFloat(argv[idx]);
        if (!isFinite(i)) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -i has an invalid value!";
          }
        }
        break;
      case "-z":
      case "--zoom":
        if (rSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -r!";
          };
        }
        rSpec = true;
        idx++;
        if (idx >= argv.length()) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -r has no value!";
          };
        }
        r = parseFloat(argv[idx]);
        if (!isFinite(r)) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -r has an invalid value!";
          }
        }
        break;
      case "-w";
      case "--width":
        if (wSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -w!";
          };
        }
        wSpec = true;
        idx++;
        if (idx >= argv.length()) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -w has no value!";
          };
        }
        w = parseInt(argv[idx]);
        if (!isFinite(w)) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -w has an invalid value!";
          }
        }
        break;
      case "-h";
      case "--height":
        if (hSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -h!";
          };
        }
        hSpec = true;
        idx++;
        if (idx >= argv.length()) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -h has no value!";
          };
        }
        h = parseInt(argv[idx]);
        if (!isFinite(h) || h < 0) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -h has an invalid value!";
          }
        }
        break;
      case "-t";
      case "--iterations":
        if (tSpec) {
          return {
            type: "error",
            data: "Error (mandelbrot): repeated option -t!";
          };
        }
        tSpec = true;
        idx++;
        if (idx >= argv.length()) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -t has no value!";
          };
        }
        t = parseInt(argv[idx]);
        if (!isFinite(t) || t < 0) {
          return {
            type: "error",
            data: "Error (mandelbrot): option -t has an invalid value!";
          }
        }
        break;
    }
  }
}

// Subclasses should define a next() method returning the next token or undefined in case of EOF (or throw a string in case of an error).
class LexerBase {
  str
  len
  pos
  tokenIdx
  curChar

  constructor(str) {
    this.str = str;
    this.len = str.length;
    this.pos = 0;
    this.tokenIdx = 0;
    if (str.length > 0)
      this.curChar = str[0];
  }

  reset() {
    this.pos = 0;
    this.tokenIdx = 0;
    if (str.length > 0)
      this.curChar = str[0];
  }

  advance(amt = 1) {
    let res = this.peekStr(amt);
    this.pos += amt;
    this.curChar = this.pos < this.len ? this.str[this.pos] : undefined;
    return res;
  }

  charsLeft() {
    return Math.max(0, this.len - this.pos);
  }

  remStr() {
    return this.peek(this.charsLeft());
  }

  peek(amt = 1) {
    let idx = this.pos + amt;
    return idx < this.len ? this.str[idx] : undefined;
  }

  peekStr(amt = 1) {
    let idx = this.pos + amt;
    return this.pos < this.len ? this.str.substring(this.pos, Math.min(this.len, idx)) : "";
  }

  skip(regex) {
    while (this.curChar !== undefined && regex.test(this.curChar)) {
      this.advance();
    }
  }

  allTokens() {
    let tokens = [];
    let token;
    while ((token = this.next()) !== undefined) {
      try {
        tokens.push(token);
        this.tokenIdx++;
      }
      catch (e) {
        return {
          tokens: tokens,
          error: e
        };
      }
    }
    return {
      tokens: tokens,
      error: undefined
    };
  }
}

class ArgsLexer extends LexerBase {

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

  // Parses a string delimited by curChar
  quoted() {
    let delim = this.advance();
    let res = "";
    while (this.curChar !== undefined) {
      if (this.curChar == delim) {
        this.advance();
        return res;
      }
      else if (this.curChar == "\\") {
        res += this.escaped();
      }
      else {
        res += this.advance();
      }
    }
    throw `No closing ${delim} in argument ${this.tokenIdx + 1}!`;
  }

  // Parses a string without delimiters
  unquoted() {
    let res = "";
    while (this.curChar !== undefined) {
      if (/\s/.test(this.curChar)) {
        this.advance();
        return res;
      }
      else if (this.curChar == "\\") {
        res += this.escaped();
      }
      else {
        res += this.advance();
      }
    }
    return res;
  }

  // Parses a Java-style escape sequence (plus \[whitespace])
  escaped() {
    this.advance();
    if (this.curChar === undefined) {
      throw `Invalid escape sequence \\ in argument ${this.tokenIdx + 1}!`;
    }
    let seq = this.advance();
    if (/\s/.test(seq)) {
      return seq;
    }
    switch (seq) {
      case "t": return "\t";
      case "b": return "\b";
      case "n": return "\n";
      case "r": return "\r";
      case "v": return "\v";
      case "\'": return "\'";
      case "\"": return "\'";
      case "\\": return "\\";
      case "u":
        seq = this.advance(4);
        if (!/^[0-9a-fA-F]{4}$/.test(seq)) {
          throw `Invalid escape sequence \\u${seq} in argument ${this.tokenIdx + 1}!`;
        }
        else {
          return String.fromCharCode(parseInt(seq, 16));
        }
        break;
      default: throw `Invalid escape sequence \\${seq} in argument ${this.tokenIdx + 1}!`;
    }
  }
}

//function parse(msg) {
//  let ret = {
//    argc: 0,
//    argv: []
//  };
//  let pos = 0;
//  while (pos < msg.length) {
//    if (/\s/.test(msg[pos])) {
//      while (pos < msg.length && /\s/.test(msg[pos])) {
//        pos++;
//      }
//    }
//    else {
//      let start = pos;
//      while (pos < msg.length && !/\s/.test(msg[pos])) {
//        pos++;
//      }
//      ret.argc++;
//      ret.argv.push(msg.subthis.string(start, pos));
//    }
//  }
//}