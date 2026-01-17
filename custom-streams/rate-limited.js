const { Writable } = require("node:stream");

/**
 * Esta clase RateLimitedStream sirve para limitar la cantidad de datos (bytes) que se pueden escribir
 * en el stream por segundo. Es decir, aunque envíes muchos datos juntos, solo deja pasar, por ejemplo,
 * 100 bytes cada segundo (o el valor que tú definas).
 * 
 * ¿Para qué puede servir esto en la vida real? 
 * Ejemplos:
 * 
 * - Subidas de archivos a la nube: para no saturar la red del usuario ni sobrecargar el servidor, vas "goteando"
 *   los bytes poco a poco (por ejemplo, fotos o videos pesados).
 * - Streaming de audio/video: enviar datos a una velocidad constante para evitar cortes y buffer.
 * - Pruebas de aplicaciones móviles: simular velocidad lenta de red y ver cómo se comporta tu app.
 * - Consumir APIs externas: algunas APIs solo permiten cierta cantidad de datos o peticiones por segundo.
 * - Dispositivos IoT: proteger la red en dispositivos de bajo consumo, evitando congestión o picos de tráfico.
 * - Respeto a cuotas o límites: evitar que un usuario consuma demasiados recursos en sistemas compartidos.
 * - Evitar bloqueos automáticos: algunos servicios bloquean clientes si envías datos demasiado rápido.
 * 
 * En resumen, limitar bytes por segundo ayuda a regular el uso de recursos y evitar problemas por exceso de velocidad.
 */

class RateLimitedStream extends Writable {
  constructor(maxBytesPerSecond) {
    super();

    this.maxBytesPerSecond = maxBytesPerSecond;
    this.currentBytes = 0;
    this.startTime = Date.now();
    this.queue = [];
    this.processing = false;
  }

  _write(chunk, encoding, callback) {
    this.queue.push({ chunk, callback });

    if (!this.processing) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;

    // Calcula cuántos segundos han pasado desde que se inició el ciclo de conteo actual.
    const elapsed = (Date.now() - this.startTime) / 1000;

    if (elapsed >= 1) {
      console.log("--------------------------------");
      console.log("✅ 1 segundo transcurrido, reiniciando...");
      console.log("--------------------------------");

      this.currentBytes = 0;
      this.startTime = Date.now();
    }

    const { chunk, callback } = this.queue.shift();

    // Revisamos si el chunk es más grande que el límite permitido por segundo
    if (chunk.length > this.maxBytesPerSecond) {
      // Dividimos el chunk en partes más pequeñas
      const firstPart = chunk.slice(0, this.maxBytesPerSecond - this.currentBytes);
      const remaining = chunk.slice(this.maxBytesPerSecond - this.currentBytes);

      if (firstPart.length > 0 && this.currentBytes < this.maxBytesPerSecond) {
        this.currentBytes += firstPart.length;
        console.log(`📝 Procesando ${firstPart.length} bytes (${this.currentBytes}/${this.maxBytesPerSecond} bytes/seg)`);
        // Llamamos el callback al procesar la última parte del chunk original
        if (remaining.length === 0) {
          callback(null);
        } else {
          // Volvemos a poner el restante en la cola, asociando el mismo callback solo a la última parte
          this.queue.unshift({ chunk: remaining, callback });
        }
        setImmediate(() => this.processQueue());
      } else {
        // Si ya alcanzamos el límite dentro de este segundo, esperamos el siguiente ciclo
        const waitTime = Math.max(0, 1000 - (Date.now() - this.startTime));
        console.log(`⏳ Límite alcanzado (chunk grande), esperando ${waitTime}ms...`);
        this.queue.unshift({ chunk, callback });
        setTimeout(() => {
          this.currentBytes = 0;
          this.startTime = Date.now();
          this.processQueue();
        }, waitTime);
      }
    } else if (this.currentBytes + chunk.length <= this.maxBytesPerSecond) {
      // Todavía no se alcanza el límite, procesamos el chunk ahora
      this.currentBytes += chunk.length;
      console.log(`📝 Procesando ${chunk.length} bytes (${this.currentBytes}/${this.maxBytesPerSecond} bytes/seg)`);
      callback(null); 
      setImmediate(() => this.processQueue()); 
    } else {
      // Ya se alcanzó el límite, hay que esperar el resto del segundo
      const waitTime = Math.max(0, 1000 - (Date.now() - this.startTime));
      console.log(`⏳ Límite alcanzado, esperando ${waitTime}ms...`);

      this.queue.unshift({ chunk, callback });

      setTimeout(() => {
        this.currentBytes = 0;
        this.startTime = Date.now();
        this.processQueue();
      }, waitTime);
    }
  }
}

const limiter = new RateLimitedStream(100);

console.log("=== Ejemplo 1: Validación del límite de bytes por segundo ===");
console.time("execution time");
for (let i = 0; i < 5; i++) {
  limiter.write(Buffer.from('X'.repeat(20))); // 20 bytes cada uno
}

setTimeout(() => {
  console.log("\n=== Ejemplo 2: Validación del segundo transcurrido y numero de bytes procesados ===");
  limiter.write(Buffer.from('Y'.repeat(120))); // 120 bytes
  limiter.end();
}, 2500);

limiter.on("finish", () => {
  console.log("--------------------------------");
  console.log("Stream finalizado");
  console.log("--------------------------------");
  console.timeEnd("execution time");
});