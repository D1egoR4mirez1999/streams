const fs = require("fs/promises");

// Execution time: 2:26.046 (m:ss.mmm)
// Memory usage: 45MB
(async () => {
  const fileHandlerRead = await fs.open("text-gigantic.txt", "r");
  const fileHandlerWrite = await fs.open("text.txt", "w");

  const streamRead = fileHandlerRead.createReadStream();
  const streamWrite = fileHandlerWrite.createWriteStream();

  let buffer = ""; // buffer to store the numbers that are not in the correct order

  console.time("read big file");

  streamRead.on("end", () => {
    fileHandlerRead.close();
    fileHandlerWrite.close();
    console.timeEnd("read big file");
  });

  streamRead.on("data", (chunk) => {
    const data = buffer + chunk.toString();
    const numbers = data.split("  ");

    buffer = numbers.pop();

    numbers.forEach((number) => {
      const n = Number(number);

      if (n % 2 === 0) {
        if (!streamWrite.write(" " + n + " ")) {
          streamRead.pause();
        }
      }
    });
  });

  streamWrite.on("drain", () => {
    streamRead.resume();
  });
})();
