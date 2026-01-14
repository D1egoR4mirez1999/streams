const fs = require("fs/promises");
const { Buffer } = require("buffer");

// Execution time: 5.529s
// Memory usage: 15MB
(async () => {
  const sourceFile = await fs.open("text-gigantic.txt", "r");
  const destinationFile = await fs.open("text-gigantic-copy.txt", "w");
  let bytesRead = -1;

  console.time("read");
  while (bytesRead !== 0) {
    const result = await sourceFile.read();

    if (result.bytesRead !== 16384) {
      const indexNotFilled = result.buffer.indexOf(0);
      const buff = Buffer.alloc(indexNotFilled);

      result.buffer.copy(buff, 0, 0, indexNotFilled);

      await destinationFile.write(buff);
    } else {
      await destinationFile.write(result.buffer);
    }
  }
  console.timeEnd("read");
})();
