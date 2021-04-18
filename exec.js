const Actions = require("./actions.js");
const Lexer = require("./lexer");

const Mandelbrot = require("./mandelbrot/main.js");

function execute(msg) {
	let lexer = new ArgsLexer(msg);
	let lexRes = lexer.allTokens();
	let isErr = lexRes.error !== undefined;
	let err = Actions.message(lexRes.error, []);
	let argv = lexRes.tokens;
	//console.log(JSON.stringify(Mandelbrot));
	if (argv.length > 0) {
		switch (argv[0]) {
			case "!mandelbrot": return isErr ? [err] : Mandelbrot.execute(argv);
		}
	}
	return undefined;
	console.log("done");
}

class ArgsLexer extends Lexer {

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
}

module.exports = {
	execute
};
