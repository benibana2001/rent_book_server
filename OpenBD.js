const fetch = require("node-fetch");
const fs = require("fs");
const request = require("request");

module.exports = class OpenBD {
  constructor() {
    this._isbn = "";
    this._imagePath = "";
    this.HOST = "https://api.openbd.jp/v1/get";
  }

  set isbn(isbn) {
    this._isbn = isbn;
  }

  get isbn() {
    return this._isbn;
  }

  set imagePath(path) {
    this._imagePath = path;
  }

  get imagePath() {
    return this._imagePath;
  }

  async search(isbn) {
    this.isbn = isbn;
    const url = this.HOST + "?isbn=" + this.isbn + "&pretty";
    const res = await fetch(url);
    const ary = await res.json();
    const data = ary[0];

    return data.summary;
  }

  async downloadCoverImage(isbn) {
    const res = await this.search(isbn);

    promiseFileDownload(res)
      .then(promiseFileDownloadSuccess(this.imagePath))
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

    if (!res.cover) {
      reject({ error: `Cover is none; isbn: ${res.isbn}` });
    }

    request.get(res.cover, options, (error, response, body) => {
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

const promiseFileDownloadSuccess = (path) => (res) => {
  const buffer = new Buffer.from(res.body);
  const contentType = res.header["content-type"];

  createDirectory(path);
  const fileName = path + res.isbn + extension(contentType);

  writeFile(fileName, buffer);
};

const promiseFileDownloadFail = (res) => {
  const errorMessage = res.error;
  console.log(errorMessage);
};

const createDirectory = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};
