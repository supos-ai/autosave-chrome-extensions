const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const mkdir = promisify(fs.mkdir);

const sourceFolder = path.resolve(__dirname, "../build");
const destinationFolder = path.resolve(__dirname, "../../extensions/build/app");

const copyFile = promisify(fs.copyFile);

!fs.existsSync(sourceFolder) && fs.mkdirSync(sourceFolder);

fs.watch(sourceFolder, { recursive: true }, async (eventType, filename) => {
  if (eventType === "change") {
    const sourceFilePath = path.join(sourceFolder, filename);
    const destinationFilePath = path.join(destinationFolder, filename);

    if (sourceFilePath.includes("index.html")) {
      let html = fs.readFileSync(sourceFilePath, "utf-8");
      if (html.match(/src="\/static\/js\/bundle.js"/)) {
        html = html.replace("/static/js/bundle.js", "./static/js/bundle.js");
        fs.writeFileSync(sourceFilePath, html, "utf-8");
      }
    }

    try {
      await mkdir(path.dirname(destinationFilePath), { recursive: true });
      await copyFile(sourceFilePath, destinationFilePath);
      console.log(`File ${filename} copied successfully.`);
    } catch (error) {
      console.error(`Error copying file ${filename}:`, error);
    }
  }
});
