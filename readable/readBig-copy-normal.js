const fs = require("fs/promises");

(async () => {
  console.time("read big file");
  
  const sourceFile = await fs.open("text-gigantic.txt", "r");
  const destinationFile = await fs.open("text-gigantic-copy.txt", "w");

  const readStream = sourceFile.createReadStream();
  const writeStream = destinationFile.createWriteStream();

  readStream.on("data", (chunk) => {
    if (!writeStream.write(chunk)) {
      readStream.pause();
    }
  });

  writeStream.on("drain", () => {
    readStream.resume();
  });

  readStream.on("end", () => {
    sourceFile.close();
    destinationFile.close();
    
    console.timeEnd("read big file");
  });
})();