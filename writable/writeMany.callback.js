const fs = require("fs");

// Execution time: 14s
// Memory usage: 800MB
// CPU: 15%
(() => {
  fs.open("text.txt", "w", (error, fd) => {
    if (error) {
      console.log("something went wrong");
      return;
    }

    console.time("write many");
    for (let i = 0; i <= 1000000; i++) {
      fs.write(fd, ` ${i} `, () => {});
    }
    console.timeEnd("write many");
  });
})();