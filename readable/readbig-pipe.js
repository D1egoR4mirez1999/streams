const fs = require("fs/promises");
const { pipeline } = require("stream/promises");

// Execution time: 1.336s
// Memory usage: 20MB
(async () => {
  console.time("read");

  const sourceFile = await fs.open("text-gigantic.txt", "r");
  const destinationFile = await fs.open("text-gigantic-copy.txt", "w");

  const rs = sourceFile.createReadStream();
  const ws = destinationFile.createWriteStream();

  /**
   * Unsafe way to use piping because we don't have an easy way to handle errors.
   */
  // rs.pipe(ws);

  // rs.on("end", ()=> {
  //   console.timeEnd("read");
  // });

  /**
   * Better way to use piping with error handling.
   * We can also use a third party library called pump.
   */
  const p = async () => {
    await pipeline(rs, ws);
    console.timeEnd("read");
  };

  p().catch((err) => console.log(err));
})();
