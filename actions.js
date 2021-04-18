module.exports = {
  error: function(text) {
    return {
      type: "error",
      data: text
    };
  },

  message: function(text, files = []) {
    return {
      type: "message",
      data: {
        text: text,
        files: files
      }
    };
  }
};