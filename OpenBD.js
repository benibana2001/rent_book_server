const fetch = require("node-fetch");
const fs = require("fs");
const request = require("request");

module.exports = class OpenBD {
  constructor() {
    this._isbn = "";
    this._imagePath = "";
    this.HOST = "https://api.openbd.jp/v1/get";

    this.errMessage = {
      noData: (payload) => `no data on ObenPD: ${payload}`,
    };
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

    /**
     * @type {object}
     */
    const data = ary[0];

    const noDataOnOpenBD =
      !data ||
      typeof data !== "object" ||
      !Object.prototype.hasOwnProperty.call(data, "summary");

    if (noDataOnOpenBD) {
      throw new Error(this.errMessage.noData(isbn));
    }

    return data.summary;
  }

  async downloadCoverImage(isbn) {
    const res = await this.search(isbn).catch(handleError);

    function handleError(err) {
      console.log(err, "skip this entry");
      throw new Error(err);
    }

    promiseFileDownload
      .download(res)
      .then(promiseFileDownload.success(this.imagePath))
      .catch(promiseFileDownload.fail);

    return res;
  }

  writeJSON(filepathname, res) {
    const bookdata = {
      isbn: res.isbn,
      title: res.title,
      publisher: res.publisher,
      pubdate: res.pubdate,
      cover: res.cover,
      author: res.author,
    };

    // if there is no file, create new one.
    syncIO.checkExist(filepathname, createNewFile);

    syncIO.readAsJSON(filepathname, (json) => {
      // postscript to JSON
      json.push(bookdata);
      syncIO.write(filepathname, JSON.stringify(json));
      //   console.log(`write is done: ${JSON.stringify(json)}`);
    });

    function createNewFile() {
      syncIO.write(filepathname, "[]");
    }
  }

  alignJSON(filepathname) {
    syncIO.readAsJSON(filepathname, (json) => {
      for (let i = 0; i < json.length; i++) {
        for (let j = json.length - 1; j > i; j--) {
          const alignPublishDate =
            Number(json[j].pubdate) < Number(json[j - 1].pubdate);
          const alignISBN = json[j].isbn < json[j - 1].isbn;

          if (alignPublishDate) {
            const temp = json[j];
            json[j] = json[j - 1];
            json[j - 1] = temp;
            continue;
          }

          if (alignISBN) {
            const temp = json[j];
            json[j] = json[j - 1];
            json[j - 1] = temp;
          }
        }
      }

      syncIO.write(filepathname, JSON.stringify(json));
    });
  }
};

const syncIO = {
  checkExist: (filePath, errCallback) => {
    try {
      fs.statSync(filePath);
    } catch (err) {
      errCallback();
      console.log(`fs.stat err: ${err}`);
      console.log("=> create new file");
    }
  },

  write: (filepathname, text) => {
    try {
      fs.writeFileSync(filepathname, text);
    } catch (err) {
      if (err) console.log(`fs.writeFile err: ${err}`);
    }
  },

  readAsJSON: (filePath, callback) => {
    try {
      const buffer = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(buffer);
      if (json) callback(json);
    } catch (err) {
      console.log(`fs.readFile err: ${err}`);
    }
  },

  createDir: (path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  },
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

const promiseFileDownload = {
  download: (res) => {
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
  },

  success: (path) => (res) => {
    const buffer = new Buffer.from(res.body);
    const contentType = res.header["content-type"];

    syncIO.createDir(path);
    const fileName = path + res.isbn + extension(contentType);

    writeFile(fileName, buffer);
  },

  fail: (res) => {
    const errorMessage = res.error;
    console.log(errorMessage);
  },
};

const writeFile = (fileName, buffer) => {
  fs.writeFile(fileName, buffer, (err) => {
    if (err) console.log(err);
  });
};
