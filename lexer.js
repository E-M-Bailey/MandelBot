// Subclasses should define a next() method returning the next token or undefined in case of EOF (or throw a string in case of an error).
class Lexer {
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

  // Utility method for parsing booleans case-insensitively
  parseBoolean(str) {
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

  // Utility method that parses a string with quotation marks.
  // precondition: curChar should be the opening quotation mark.
  // delim, which is the ending quotation mark, should be a regex and defaults to matching only curChar.
  // extra is the argument passed to escape.
  quoted(delim, extra) {
    if (delim === undefined) {
      delim = new RegExp(this.curChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    }
    this.advance();
    let res = "";
    while (this.curChar !== undefined) {
      if (delim.test(this.curChar)) {
        this.advance();
        return res;
      }
      else if (this.curChar == "\\") {
        res += this.escape(extra);
      }
      else {
        res += this.advance();
      }
    }
    throw `No closing quotation mark in argument ${this.tokenIdx}`;
  }

  // Utility method that parses a string without quotation marks.
  // delim, which specifies which characters to end on, should be a regex and defaults to any whitespace.
  // extra is the argument passed to escape.
  unquoted(delim = /\s/, extra) {
    let res = "";
    while (this.curChar !== undefined) {
      if (delim.test(this.curChar)) {
        this.advance();
        return res;
      }
      else if (this.curChar == "\\") {
        res += this.escape(extra);
      }
      else {
        res += this.advance();
      }
    }
    return res;
  }

  // Utility method that parses a Java-style escape sequence.
  // extra, which should be a regex, specifies other characters that can be escaped and defaults to any whitespace.
  escape(extra = /\s/) {
    this.advance();
    if (this.curChar === undefined) {
      throw `Invalid escape sequence \\ in argument ${this.tokenIdx}`;
    }
    let seq = this.advance();
    if (extra.test(seq)) {
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
};

module.exports = Lexer;
