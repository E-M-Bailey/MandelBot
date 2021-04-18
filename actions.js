class Actions {
  static error(text) {
    return {
      type: "error",
      data: text
    };
  }

  static message(text, files = []) {
    return {
      type: "message",
      data: {
        text: text,
        files: files
      }
    };
  }
}

module.exports = Actions;
