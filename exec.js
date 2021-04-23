const Actions = require("./actions.js");
const Lexer = require("./lexer");

const Mandelbrot = require("./mandelbrot/main.js");

function execute(msg, itfArgs) {
	let lexer = new ArgsLexer(msg);
	let lexRes = lexer.allTokens();
	let error = lexRes.error;
	let argv = lexRes.tokens;
	if (argv.length > 0) {
		switch (argv[0]) {
			case "m!mandelbrot":
				if (!error) {
					try {
						return Mandelbrot.execute(argv, itfArgs);
					}
					catch (e) {
						error = e;
					}
				}
				return [Actions.message(error)];
		}
	}
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
