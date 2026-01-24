const { Transform, pipeline } = require("node:stream");
const fs = require("node:fs/promises");

class EncryptionStream extends Transform {
  constructor(fileSize) {
    super();

    this.fileSize = fileSize;
    this.currentSize = 0;
    this.nextLog = 0.1;
  }

  _transform(chunk, encoding, callback) {
    this.currentSize += chunk.length;

    while ((this.currentSize / this.fileSize) >= this.nextLog && this.nextLog <= 1) {
      const porcentaje = ((this.currentSize / this.fileSize) * 100).toFixed(2);
      console.log(`Encriptado: ${porcentaje}%`);
      this.nextLog += 0.1;
    }

    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) {
        chunk[i]++;
      }
    }

    callback(null, chunk);
  }
}

(async () => {
  const readFileHandler = await fs.open("source.txt", "r");
  const writeFileHandler = await fs.open("encrypted_data.txt", "w");

  const fileStats = await readFileHandler.stat();
  const fileSize = fileStats.size;

  const readStream = readFileHandler.createReadStream();
  const writeStream = writeFileHandler.createWriteStream();

  const encryptionStream = new EncryptionStream(fileSize);

  pipeline(readStream, encryptionStream, writeStream, (err) => {
    if (err) {
      console.error(err);
    }
  });
})();