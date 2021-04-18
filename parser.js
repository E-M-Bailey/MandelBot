const Actions = require("./actions.js");
const Mandelbrot = require("./mandelbrot.js");

module.exports = {
  execute: function(msg) {
    let lexer = new ArgsLexer(msg);
    let lexRes = lexer.allTokens();
    let isErr = lexRes.error !== undefined;
    //let err = {
    //  type: "error",
    //  data: lexRes.error
    //};
    let err = Actions.message(lexRes.error, []);
    let argv = lexRes.tokens;
    if (argv.length > 0) {
      switch (argv[0]) {
        case "!mandelbrot": return isErr ? [err] : Mandelbrot.execute(argv);
      }
    }
    return undefined;
    console.log("done");
  }
};

function parseBoolean(str) {
  str = String(str).toLowerCase();
  if (str == "true") {
    return true;
  }
  else if (str == "false") {
    return false;
  }
  else {
    return undefined;
  }
}

//function tempMB(r, i, z, w, h, t, s) {
//  return {
//    type: "text",
//    data: `
//r = ${r},
//i = ${i},
//z = ${z},
//w = ${w},
//h = ${h},
//t = ${t},
//s = ${s}
//`
//  };
//}

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
    while (true) {
      try {
        token = this.next();
        if (token === undefined) {
          break;
        }
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
    throw `No closing ${delim} in argument ${this.tokenIdx}`;
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
      throw `Invalid escape sequence \\ in argument ${this.tokenIdx}`;
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
          throw `Invalid escape sequence \\u${seq} in argument ${this.tokenIdx}`;
        }
        else {
          return String.fromCharCode(parseInt(seq, 16));
        }
        break;
      default: throw `Invalid escape sequence \\${seq} in argument ${this.tokenIdx}`;
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