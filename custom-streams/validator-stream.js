const { Writable } = require("node:stream");

class ValidatorStream extends Writable {
  constructor() {
    super();

    this.validCount = 0;
    this.invalidCount = 0;
    this.validData = [];
  }

  _write(chunk, encoding, callback) {
    const data = chunk.toString().trim();
    const number = parseFloat(data);

    if (!isNaN(number) && number >= 0 && number <= 100) {
      // Valid data
      this.validCount++;
      this.validData.push(number);

      console.log(`✅ Valid data: ${number}`);
    } else {
      // Invalid data
      this.invalidCount++;
      console.log(`❌ Invalid data: ${data}`);
    }

    callback(null);
  }

  _final(callback) {
    console.log("--------------------------------");
    console.log(`✅ Valid count: ${this.validCount}, Invalid count: ${this.invalidCount}`);
    // Usamos reduce para sumar todos los elementos del array this.validData.
    // reduce recorre el array acumulando el resultado según la función pasada.
    // Ejemplo: [2, 4, 6].reduce((a, b) => a + b, 0) devuelve 12.
    // reduce es útil para calcular sumas, totales, promedio, concatenar cadenas, etc.
    console.log(`✅ Average of valid data: ${this.validData.length > 0 ? 
      (this.validData.reduce((a,b) => a+b) / this.validData.length).toFixed(2) : 0}`);
    console.log("--------------------------------");

    callback(null);
  }
}

const validatorStream = new ValidatorStream();

validatorStream.write('50\n');
validatorStream.write('150\n');  // inválido
validatorStream.write('75\n');
validatorStream.write('abc\n');  // inválido
validatorStream.write('25\n');
validatorStream.end();