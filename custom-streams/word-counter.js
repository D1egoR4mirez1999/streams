const { Writable } = require('stream');

class WordCounterStream extends Writable {
  constructor() {
    super();
    this.wordCount = 0;
    this.charCount = 0;
    this.buffer = ''; // Para acumular datos incompletos

    console.log("HighWaterMark: ", this.writableHighWaterMark);
  }

  // Este método se llama cada vez que alguien escribe datos al stream
  _write(chunk, encoding, callback) {
    // chunk es un Buffer con los datos que se están escribiendo
    const data = this.buffer + chunk.toString();
    
    // Dividir por espacios y contar palabras
    const words = data.split(/\s+/);
    
    // El último elemento podría estar incompleto (si el chunk se cortó a mitad de palabra)
    // Lo guardamos para el próximo chunk
    this.buffer = words.pop() || '';
    
    // Contar las palabras completas
    this.wordCount += words.length;
    this.charCount += chunk.length;
    
    // Simulamos que "escribimos" los datos (aunque en realidad solo los contamos)
    // En un stream real, aquí escribirías a un archivo, base de datos, etc.
    
    console.log(`📝 Recibidos ${chunk.length} bytes. Palabras hasta ahora: ${this.wordCount}`);
    
    // Llamamos al callback para indicar que procesamos este chunk
    // Si pasamos un error, el stream se detiene
    callback(null); // null = sin errores
  }

  // Este método se llama cuando el stream se cierra (cuando llamas a .end())
  _final(callback) {
    // Procesar el buffer final (la última palabra incompleta)
    if (this.buffer.trim()) {
      this.wordCount++;
    }
    
    console.log('\n✅ Stream finalizado!');
    console.log(`📊 Total de palabras: ${this.wordCount}`);
    console.log(`📊 Total de caracteres: ${this.charCount}`);
    
    callback(null);
  }
}

// ===== USO DEL STREAM =====

const wordCounter = new WordCounterStream();

// Escribir datos al stream
wordCounter.write('Hola mundo desde ');
wordCounter.write('Node.js streams! ');
wordCounter.write('Este es un ejemplo de custom writable stream.');

// Cerrar el stream (esto dispara _final)
wordCounter.end();