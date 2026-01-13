const fs = require("fs");

// Execution time: 5s
// Memory usage: 28MB
// CPU: 5%
(() => {
  fs.open("text.txt", "w", (error, fd) => {
    if (error) {
      console.log("something went wrong");
      return;
    }

    console.time("write many");
    for (let i = 0; i <= 1000000; i++) {
      fs.writeSync(fd, ` ${i.toString()} `, () => {});
    }
    console.timeEnd("write many");
  });
})();
