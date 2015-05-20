// StringService.js
module.exports = {

    normalize: function (str) {
      return str.replace(/\s+/g, ' ').trim().toLowerCase();
    },

    makeTitle: function (str) {
        return (str[0].toUpperCase() + str.slice(1)).trim();
    }

};