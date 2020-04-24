require("dotenv").config();
const exec = require("child_process").exec;

const serverName = process.env.SERVER_NAME;
const serverDir = process.env.SERVER_DIR;

const targetDir = "./public/";

const options = ["-av"];

const callback = (err, stdout, stderr) => {
  if (err) console.log(`err: ${err}`);
  if (stdout) console.log(`stdout: ${stdout}`);
  if (stderr) console.log(`stderr: ${stderr}`);
};

exec(`rsync ${options[0]} ${targetDir} ${serverName}:${serverDir}`, callback);
