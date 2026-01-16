const { Writable } = require("node:stream");
const fs = require("node:fs");

class FsWritable extends Writable {
  constructor({ fileName, highWaterMark }) {
    super({ highWaterMark });
    this.fileName = fileName;
    this.fd = null;

    this.chunks = [];
    this.chunksSize = 0;

    this.writes = 0;
  }

  _construct(callback) {
    fs.open(this.fileName, "w", (err, fd) => {
      if (err) {
        callback(err);
      } else {
        this.fd = fd;
        callback();
      }
    });
  }

  _write(chunk, encoding, callback) {
    this.chunks.push(chunk);
    this.chunksSize += chunk.length;

    if (this.chunksSize > this.writableHighWaterMark) {
      fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
        if (err) {
          return callback(err);
        }

        this.chunks = [];
        this.chunksSize = 0;
        this.writes++;
        callback();
      });
    } else {
      callback();
    }
  }

  _final(callback) {
    fs.write(this.fd, Buffer.concat(this.chunks), (err) => {
      if (err) {
        return callback(err);
      }

      this.chunks = [];
      this.writes++;
      callback();
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

// Execution time 1.729s with one million times;
// Memory usage: 40MB
const oneMillionTimes = 10000000; // one million times;
(async () => {
  const fsWritable = new FsWritable({ fileName: "text.txt" });
  let i = oneMillionTimes;

  console.time("write many");
  write();

  fsWritable.on("finish", () => {
    console.log("writes: ", fsWritable.writes);

    console.timeEnd("write many");
  });

  function write() {
    let ok = true;

    do {
      i--;
      if (i === 0) {
        // Last time!
        fsWritable.end(` ${i} `);
      } else {
        // See if we should continue, or wait.
        ok = fsWritable.write(` ${i} `);
      }
    } while (i > 0 && ok);

    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      fsWritable.once("drain", write);
    }
  }
})();
