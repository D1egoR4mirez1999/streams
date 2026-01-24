const { Writable } = require("node:stream");
const fs = require("node:fs");

class TeeStream extends Writable {
  constructor(destinations) {
    super();
    this.destinations = destinations;
    this.writeCount = 0;
  }

  _write(chunk, encoding, callback) {
    this.writeCount++;
    let completed = 0;
    let hasError = null;

    this.destinations.forEach((dest) => {
      dest.write(chunk, (err) => {
        if (err && !hasError) {
          hasError = err;
        }

        completed++;
        if (completed === this.destinations.length) {
          if (hasError) {
            callback(hasError);
          } else {
            console.log(`✅ Escrito a ${this.destinations.length} destinos (write #${this.writeCount})`);
            callback(null);
          }
        }
      })
    });
  }

  _final(callback) {
    let close = 0;
    this.destinations.forEach((dest) => {
      dest.end(() => {
        close++;
        if (close === this.destinations.length) {
          console.log(`✅ Cerrado ${this.destinations.length} destinos`);
          callback(null);
        }
      })
    });
  }
}

const file1 = fs.createWriteStream('output1.txt');
const file2 = fs.createWriteStream('output2.txt');
const file3 = fs.createWriteStream('output3.txt');

const tee = new TeeStream([file1, file2, file3]);
tee.write('Mismo dato para todos\n');
tee.write('Otro dato\n');
tee.end();