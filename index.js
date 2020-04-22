const OpenBD = require("./OpenBD");

const openbd = new OpenBD();

(async () => {
  const res = await openbd.downloadCoverImage("9784047353374");
  console.log(res)
})();
