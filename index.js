const OpenBD = require("./OpenBD");
const Shinkan = require("./Shinkan");

const openbd = new OpenBD();
const shinkan = new Shinkan();

(async () => {
  openbd.imagePath = "public/downloadimage/";

  let isbns = shinkan.getShinkanData();
  isbns = isbns.slice(0, 4);
  console.log(isbns)
  const comicDatas = [];

  isbns.map(async (isbn) => {
    const comicData = await openbd.downloadCoverImage(isbn);
    comicDatas.push(comicData);
  });

  console.log(comicDatas)
})();
