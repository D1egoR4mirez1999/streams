const fs = require("fs/promises");

// Execution time: 6s
// Memory usage: 215MB
// CPU: 6%
// This is the naive way to write many data to a file using a write stream.
(async () => {
  const fileHandler = await fs.open("text.txt", "w");
  const writeStream = fileHandler.createWriteStream();

  console.time("write many");
  for (let i = 0; i <= 1000000; i++) {
    writeStream.write(` ${i} `);
  }
  writeStream.end();
  console.timeEnd("write many");
  
  fileHandler.close();
})();
