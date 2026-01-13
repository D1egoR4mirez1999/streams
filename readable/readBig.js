const fs = require("fs/promises");

(async () => {
  const fileHandlerRead = await fs.open("text-gigantic.txt", "r");
  const fileHandlerWrite = await fs.open("text.txt", "w");

  const streamRead = fileHandlerRead.createReadStream();
  const streamWrite = fileHandlerWrite.createWriteStream();
  let split = "";

  console.time("read big file");

  streamRead.on("end", () => {
    fileHandlerRead.close();
    fileHandlerWrite.close();
    console.timeEnd("read big file");
  });

  streamRead.on("data", (chunk) => {
    let numbers = chunk.toString().split("  ");

    const firstNumber = Number(numbers[0]);
    const secondNumber = Number(numbers[1]);

    const beforeLastOneNumber = Number(numbers[numbers.length - 2]);
    const lastOneNumber = Number(numbers[numbers.length - 1]);

    if (firstNumber !== secondNumber + 1) {
      if (split) {
        numbers[0] = split.trim() + numbers[0].trim();
      }
    }

    if (beforeLastOneNumber - 1 !== lastOneNumber) {
      split = numbers.pop();
    }

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
