// Don't use this method with readBig.js because it will not work properly. Instead, use writeMany.while-streams-properly.js.

const fs = require("fs/promises");
const { Buffer } = require("buffer");

// Execution time: 3.7s
// Memory usage: 40MB
// CPU: 5%
(async () => {
  const fileHandler = await fs.open("text.txt", "w");
  const writeStream = fileHandler.createWriteStream();
  const oneMillionTimes = 1000000; // one million times;
  let idx = 0;

  writeStream.on("finish", () => {
    console.timeEnd("write");
    fileHandler.close();
  });

  const writeMany = () => {
    let canContinue = true;

    for (; idx <= oneMillionTimes && canContinue; idx++) {
      const data = ` ${idx} `;

      if (idx === oneMillionTimes) {
        // Last write - close the stream
        writeStream.end(data);
        return;
      }

      // Try to write, check if buffer is full
      canContinue = writeStream.write(data);
    }

    // If we didn't finish, wait for drain event
    if (idx <= oneMillionTimes) {
      writeStream.once("drain", writeMany);
    }
  };

  console.time("write");
  writeMany();
})();
