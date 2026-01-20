const { Writable } = require("node:stream");

class BackPressureAwareStream extends Writable {
  constructor(maxBufferSize) {
    super();

    this.maxBufferSize = maxBufferSize;
    this.currentBufferSize = 0;
    this.pendingWrites = [];
  }

  _write(chunk, encoding, callback) {
    // Simular procesamiento lento
    const processingTime = Math.random() * 100;
    
    // Si el buffer esta lleno, encolar el chunk
    if (this.currentBufferSize + chunk.length >= this.maxBufferSize) {
      console.log(`⚠️ Buffer lleno (${this.currentBufferSize}/${this.maxBufferSize}). Esperando...`);
      this.pendingWrites.push({ chunk, callback });      
      return; // No llamamos callback todavía = pausa el stream
    }

    this.currentBufferSize += chunk.length;
    callback(null);

    // Simular escritura asincrona
    setTimeout(() => {
      console.log(`✅ Procesado: ${chunk.length} bytes (Buffer: ${this.currentBufferSize}/${this.maxBufferSize})`);

      this.currentBufferSize -= chunk.length;
      this._processPending();
    }, processingTime);
  }

  _processPending() {
    while (this.pendingWrites.length > 0) {
      const { chunk, callback } = this.pendingWrites[0];

      if (this.currentBufferSize + chunk.length <= this.maxBufferSize) {
        this.pendingWrites.shift();
        this.currentBufferSize += chunk.length;

        setTimeout(() => {
          console.log(`✅ Procesado pendiente: ${chunk.length} bytes`);
          this.currentBufferSize -= chunk.length;
          callback(null);
          this._processPending();
        }, Math.random() * 100);
      } else {
        break;
      }
    }
  }
}

const backPressureAwareStream = new BackPressureAwareStream(20);
for (let i = 0; i < 100; i++) {
  backPressureAwareStream.write(Buffer.from('X'.repeat(10))); // 20 bytes cada uno
}
backPressureAwareStream.end();