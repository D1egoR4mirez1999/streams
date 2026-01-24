const { Transform, pipeline } = require("node:stream");
const fs = require("node:fs/promises");

class DecryptionStream extends Transform {
  _transform(chunk, encoding, callback) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] !== 255) {
        chunk[i]--;
      }
    }
    
    callback(null, chunk);
  }
}

(async () => {
  const readFileHandler = await fs.open("encrypted_data.txt", "r");
  const writeFileHandler = await fs.open("decrypted_data.txt", "w");

  const readStream = readFileHandler.createReadStream();
  const writeStream = writeFileHandler.createWriteStream();

  const decryptionStream = new DecryptionStream();

  pipeline(readStream, decryptionStream, writeStream, (err) => {
    if (err) {
      console.error(err);
    }
  });
})();