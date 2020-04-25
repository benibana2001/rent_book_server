const OpenBD = require("./OpenBD");
const Shinkan = require("./Shinkan");

const openbd = new OpenBD();
const shinkan = new Shinkan();

const output = {
  downloadImagePath: "public/downloadimage/",
  generateJsonFile: "public/json/booklist.json",
};

(async () => {
  openbd.imagePath = output.downloadImagePath;

//   let isbns = shinkan.getShinkanData();
//   isbns = isbns.slice(0, 30);
  const isbns = shinkan.getShinkanData();

  console.log(isbns);
  const comicDatas = [];

  isbns.map(async (isbn) => {
    const comicData =
      (await openbd.downloadCoverImage(isbn).catch(handleError)) || null;

    if (!comicData) return;

    comicDatas.push(comicData);

    openbd.writeJSON(output.generateJsonFile, comicData);

    function handleError(err) {
      console.log(err);
    }
  });
})();
