const { Readable } = require("node:stream");
const fs = require("node:fs");
const fsPromises = require("node:fs/promises");

class FsReadStream extends Readable {
  constructor(fileName) {
    super();

    this.fileName = fileName;
    this.fd = null;
  }

  _construct(callback) {
    fs.open(this.fileName, "r", (err, fd) => {
      if (err) {
        return callback(err);
      }

      this.fd = fd;
      callback();
    });
  }

  _read(size) {
    const buffer = Buffer.alloc(size);
    
    fs.read(this.fd, buffer, 0, size, null, (err, bytesRead) => {
      if (err) {
        return this.destroy(err);
      }

      this.push(bytesRead > 0 ? buffer.subarray(0, bytesRead) : null);
    });
  }

  _destroy(error, callback) {
    if (this.fd) {
      fs.close(this.fd, (err) => {
        callback(err || error);
      });
    } else {
      callback(error);
    }
  }
}

(async () => {
  const fileHandlerWrite = await fsPromises.open("text-w.txt", "w");

  const fsReadable = new FsReadStream("text.txt");
  const streamWrite = fileHandlerWrite.createWriteStream();
  let split = "";

  console.time("read big file");

  fsReadable.on("end", () => {
    fileHandlerWrite.close();
    console.timeEnd("read big file");
  });

  fsReadable.on("data", (chunk) => {
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

      if (!streamWrite.write(" " + n + " ")) {
        fsReadable.pause();
      }
    });
  });

  streamWrite.on("drain", () => {
    fsReadable.resume();
  });
})();
