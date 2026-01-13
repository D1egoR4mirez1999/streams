const fs = require("fs/promises");

// Execution time: 3.5s
// Memory usage: 40MB
// CPU: 5%
(async () => {
  const fileHandler = await fs.open("text.txt", "w");
  const writeStream = fileHandler.createWriteStream();
  let i = 100000000 // one million times;

  console.time("write many");
  write();
  
  writeStream.on("finish", () => {
    console.timeEnd("write many");
    fileHandler.close();
  });

  function write() {
    let ok = true;

    do {
      i--;
      if (i === 0) {
        // Last time!
        writeStream.end(` ${i} `);
      } else {
        // See if we should continue, or wait.
        ok = writeStream.write(` ${i} `);
        
      }
    } while (i > 0 && ok);

    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      writeStream.once('drain', write);
    }
  }
})();
