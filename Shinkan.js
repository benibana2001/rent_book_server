const shinkanData = require("./data/booklist_2020_05.json");

module.exports = class Shinkan {
  constructor() {
    this.HOST = "";
  }

  fetch() {
    return shinkanData.list;
  }

  getShinkanData() {
    const data = this.fetch();
    const isbns = [];

    data.map((comic) => {
      const isbn = comic[3];
      isbns.push(isbn);
    });

    return isbns;
  }
};
