const fetch = require("node-fetch");
const fs = require("fs");
const request = require("request");

module.exports = class OpenBD {
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

    return { title: title, coverurl: coverurl, isbn: isbn };
  }

  async downloadCoverImage(isbn) {
    const res = await this.search(isbn);

    promiseFileDownload(res)
      .then(promiseFileDownloadSuccess)
      .catch(promiseFileDownloadFail);

    return res;
  }
};

const writeFile = (fileName, buffer) => {
  fs.writeFile(fileName, buffer, (err) => {
    if (err) console.log(err);
    else console.log(`success to write file`);
  });
};

const extension = (contentType) => {
  switch (contentType) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    default:
      return "";
  }
};

const promiseFileDownload = (res) => {
  return new Promise((resolve, reject) => {
    const options = { encoding: null };
    request.get(res.coverurl, options, (error, response, body) => {
      if (error) {
        reject({ error: error });
      } else {
        const header = response.headers;
        const data = {
          isbn: res.isbn,
          header: header,
          body: body,
        };

        resolve(data);
      }
    });
  });
};

const promiseFileDownloadSuccess = (res) => {
  const buffer = new Buffer.from(res.body);
  const contentType = res.header["content-type"];
  const fileName = res.isbn + extension(contentType);

  writeFile(fileName, buffer);
};

const promiseFileDownloadFail = (res) => {
  const errorMessage = res.error;
  console.log(errorMessage);
};
