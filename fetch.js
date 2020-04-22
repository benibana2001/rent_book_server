const fetch = require('node-fetch');

class OpenBD {
  constructor() {
    this._isbn = "";
    this.HOST = "https://api.openbd.jp/v1/get";
  }

  set isbn(isbn) {
    this._isbn = isbn;
  }

  get isbn() {
    return this._isbn;
  }

  async search(isbn) {
    this.isbn = isbn;
    const url = this.HOST + "?isbn=" + this.isbn + "&pretty";
    const res = await fetch(url);
    const ary = await res.json();
    const data = ary[0];
    const title =
      data.onix.DescriptiveDetail.TitleDetail.TitleElement.TitleText.content;
    const coverurl = data.summary.cover;
    console.log(ary);

    return { title: title, coverurl: coverurl };
  }
}

const openbd = new OpenBD();
(async () => {
  const res = await openbd.search("9784047353374");
  console.log(res);
})();
