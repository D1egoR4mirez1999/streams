const { Writable } = require("node:stream");
const fs = require("node:fs/promises");

class MultiFileWriter extends Writable {
  constructor(filePaths) {
    super();

    this.filePaths = filePaths;
    this.fileHandlers = [];
    this.currentFileIndex = 0;
  }

  async _construct(callback) {
    try {
      for (const filePath of this.filePaths) {
        const fileHandler = await fs.open(filePath, "w");
        this.fileHandlers.push(fileHandler);
      }

      callback(null);
    } catch (error) {
      callback(error);
    }
  }


  _write(chunk, encoding, callback) {
    const currentHandler = this.fileHandlers[this.currentFileIndex];
    const writeStream = currentHandler.createWriteStream();

    writeStream.write(chunk, (error) => {
      if (error) {
        return callback(error);
      }


      // Ejemplo de cómo funciona este código:
      // Supón que this.fileHandlers.length es 3 (hay 3 archivos).
      // Si this.currentFileIndex comienza en 0:
      //  1era escritura: currentFileIndex pasa a 1  (0+1) % 3 = 1
      //  2da escritura:  currentFileIndex pasa a 2  (1+1) % 3 = 2
      //  3ra escritura:  currentFileIndex pasa a 0  (2+1) % 3 = 0  (regresa al primer archivo)
      // Así, los datos se distribuyen uno a uno entre los archivos en orden circular (round-robin).
      this.currentFileIndex = (this.currentFileIndex + 1) % this.fileHandlers.length;

      callback(null);
    });
  }

  async _final(callback) {
    for (const fileHandler of this.fileHandlers) {
      await fileHandler.close();
    }

    callback(null);
  }

  async _destroy(error, callback) {
    for (const fileHandler of this.fileHandlers) {
      await fileHandler.close();
    }

    callback(error);
  }
}

const multiFileWriter = new MultiFileWriter(["file1.txt", "file2.txt", "file3.txt"]);

multiFileWriter.write("Hello, world!");
multiFileWriter.write("Hello, world! 2");
multiFileWriter.write("Hello, world! 3");
multiFileWriter.end();