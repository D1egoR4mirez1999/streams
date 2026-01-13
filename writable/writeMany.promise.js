const fs = require("fs/promises");

// Execution time: 31s
// Memory usage: 48MB
// CPU: 7%
(async () => {
  const fileHandler = await fs.open("text.txt", "w");

  console.time("write many");
  for (let i = 1; i <= 1000000; i++) {
    await fileHandler.write(` ${i.toString()} `);
  }
  console.timeEnd("write many");

  fileHandler.close();
})();