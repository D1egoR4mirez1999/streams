const { Duplex } = require("node:stream");

/**
 * EJEMPLO EDUCATIVO: Duplex Stream con Buffer Interno
 * 
 * Este Duplex stream demuestra cómo:
 * 1. Recibir datos por el lado Writable (_write)
 * 2. Almacenarlos en un buffer interno
 * 3. Emitirlos por el lado Readable (_read)
 * 
 * Analogía: Es como un buzón de correo bidireccional:
 * - Puedes depositar cartas (escribir datos)
 * - Puedes retirar cartas (leer datos)
 * - Las cartas se almacenan temporalmente en el buzón (buffer interno)
 */
class EchoDuplex extends Duplex {
  /**
   * CONSTRUCTOR
   * 
   * Paso 1: Llamar super() con las opciones
   * Paso 2: Inicializar el buffer interno (array que almacena los chunks)
   * Paso 3: Inicializar cualquier estado necesario
   */
  constructor(options = {}) {
    // IMPORTANTE: Siempre llamar super() primero
    // Esto inicializa tanto el lado Readable como Writable
    super(options);

    // Buffer interno: almacena los datos que se escriben
    // hasta que alguien los lea por el lado readable
    this.buffer = [];

    // Contador para debugging (opcional)
    this.writesReceived = 0;
    this.readsPerformed = 0;
  }

  /**
   * MÉTODO _write(chunk, encoding, callback)
   * 
   * Este método se llama AUTOMÁTICAMENTE cuando alguien hace:
   * - stream.write("datos")
   * - stream.end("datos")
   * 
   * Parámetros:
   * - chunk: Los datos que se están escribiendo (Buffer, string, etc.)
   * - encoding: La codificación si chunk es string ('utf8', 'ascii', etc.)
   * - callback: DEBES llamarlo cuando termines de procesar
   * 
   * IMPORTANTE:
   * - SIEMPRE debes llamar callback() al final
   * - Si hay error: callback(error)
   * - Si todo bien: callback() o callback(null)
   */
  _write(chunk, encoding, callback) {
    console.log(`[WRITE] Recibido: "${chunk.toString()}"`);

    // Paso 1: Convertir chunk a string para facilitar el manejo
    const data = chunk.toString();

    // Paso 2: Agregar los datos al buffer interno
    // Esto es como depositar una carta en el buzón
    this.buffer.push(data);
    this.writesReceived++;

    console.log(`[WRITE] Buffer ahora tiene ${this.buffer.length} elementos`);

    // Paso 3: IMPORTANTE - Llamar callback() para indicar que terminamos
    // Si no llamas callback(), el stream se quedará esperando
    // y no podrá procesar más escrituras
    
    // Si quisieras simular un error, harías:
    // callback(new Error("Error de ejemplo"));
    
    // En este caso, todo está bien:
    callback();
  }

  /**
   * MÉTODO _read(size)
   * 
   * Este método se llama AUTOMÁTICAMENTE cuando:
   * - Alguien hace stream.read()
   * - Alguien escucha el evento 'data'
   * - El stream necesita más datos para el pipe
   * 
   * Parámetros:
   * - size: Tamaño sugerido de bytes a leer (advisory, no obligatorio)
   * 
   * IMPORTANTE:
   * - Usa this.push(chunk) para enviar datos al lado readable
   * - this.push(null) indica que no hay más datos (EOF - End Of File)
   * - Si no hay datos disponibles, simplemente no hagas push
   * - El stream llamará _read() de nuevo cuando necesite más datos
   */
  _read(size) {
    console.log(`[READ] Solicitado leer, tamaño sugerido: ${size} bytes`);

    // Paso 1: Verificar si hay datos en el buffer
    if (this.buffer.length === 0) {
      console.log("[READ] No hay datos disponibles en el buffer");
      // No hacemos push, el stream esperará hasta que haya datos
      return;
    }

    // Paso 2: Tomar el primer elemento del buffer (FIFO: First In, First Out)
    // Es como retirar la primera carta del buzón
    const data = this.buffer.shift();
    this.readsPerformed++;

    // Paso 3: Transformar o formatear los datos (opcional)
    // En este ejemplo, agregamos un prefijo para demostrar transformación
    const formattedData = `[ECHO] ${data}`;

    console.log(`[READ] Enviando: "${formattedData}"`);

    // Paso 4: Enviar los datos al lado readable usando push()
    // Esto hará que:
    // - Se emita el evento 'data' con estos datos
    // - stream.read() devuelva estos datos
    // - El pipe continúe funcionando
    
    // Si quisieras indicar el final del stream:
    // this.push(null);
    
    this.push(formattedData);

    // Paso 5: Si hay más datos en el buffer, podemos enviarlos también
    // Esto es opcional, pero mejora el rendimiento
    // El stream llamará _read() de nuevo si necesita más datos
    if (this.buffer.length > 0) {
      console.log(`[READ] Aún hay ${this.buffer.length} elementos en el buffer`);
    }
  }

  /**
   * MÉTODO _destroy(err, callback) - OPCIONAL pero recomendado
   * 
   * Se llama cuando:
   * - stream.destroy() es llamado
   * - Ocurre un error
   * 
   * Úsalo para limpiar recursos (cerrar archivos, conexiones, etc.)
   */
  _destroy(err, callback) {
    console.log("[DESTROY] Limpiando recursos...");
    
    // Limpiar el buffer
    this.buffer = [];
    
    // Si hay algún recurso que cerrar (archivos, conexiones, etc.):
    // if (this.fd) {
    //   fs.close(this.fd, (closeErr) => {
    //     callback(closeErr || err);
    //   });
    // } else {
    //   callback(err);
    // }
    
    // En este ejemplo simple, solo llamamos callback
    callback(err);
  }

  /**
   * MÉTODO _final(callback) - OPCIONAL
   * 
   * Se llama cuando:
   * - stream.end() es llamado
   * - Antes de emitir el evento 'finish'
   * 
   * Úsalo para:
   * - Escribir datos finales
   * - Cerrar recursos
   * - Enviar cualquier dato pendiente
   */
  _final(callback) {
    console.log("[FINAL] Finalizando escritura...");
    console.log(`[FINAL] Total escrituras recibidas: ${this.writesReceived}`);
    
    // Aquí podrías hacer algo final, como:
    // - Enviar un mensaje de cierre al buffer
    // - Cerrar conexiones
    // - Escribir datos pendientes
    
    // IMPORTANTE: Siempre llamar callback()
    callback();
  }
}

// ============================================
// EJEMPLO DE USO
// ============================================

console.log("\n=== EJEMPLO 1: Uso básico con eventos ===\n");

const duplex1 = new EchoDuplex();

// LADO READABLE: Escuchar datos que salen del stream
duplex1.on("data", (chunk) => {
  console.log(`[CONSUMER] Recibí del readable: ${chunk.toString()}`);
});

duplex1.on("end", () => {
  console.log("[CONSUMER] El stream readable terminó");
});

// LADO WRITABLE: Escribir datos al stream
duplex1.write("Hola");
duplex1.write(" Mundo");
duplex1.write(" desde Duplex!");

// Finalizar escritura
duplex1.end(" Fin del mensaje.");

// ============================================
// EJEMPLO 2: Usando pipe (más común)
// ============================================

// console.log("\n\n=== EJEMPLO 2: Usando pipe ===\n");

// const duplex2 = new EchoDuplex();
// const { Writable } = require("node:stream");

// // Crear un Writable simple que solo imprime
// const printer = new Writable({
//   write(chunk, encoding, callback) {
//     console.log(`[PRINTER] Imprimiendo: ${chunk.toString()}`);
//     callback();
//   },
// });

// // Pipe: Conectar el readable del duplex al writable
// duplex2.pipe(printer);

// // Escribir datos al duplex
// duplex2.write("Mensaje 1");
// duplex2.write("Mensaje 2");
// duplex2.end("Mensaje final");

// ============================================
// EJEMPLO 3: Leer explícitamente con read()
// ============================================

// console.log("\n\n=== EJEMPLO 3: Usando read() explícito ===\n");

// const duplex3 = new EchoDuplex();

// // Escribir datos primero
// duplex3.write("Primer mensaje");
// duplex3.write("Segundo mensaje");

// // Leer datos explícitamente
// setTimeout(() => {
//   let chunk;
//   while ((chunk = duplex3.read()) !== null) {
//     console.log(`[READ EXPLICIT] Leí: ${chunk.toString()}`);
//   }
  
//   duplex3.end("Último mensaje");
  
//   setTimeout(() => {
//     const lastChunk = duplex3.read();
//     if (lastChunk) {
//       console.log(`[READ EXPLICIT] Leí: ${lastChunk.toString()}`);
//     }
//     duplex3.destroy();
//   }, 100);
// }, 100);

// ============================================
// RESUMEN DE CONCEPTOS CLAVE
// ============================================

/**
 * RESUMEN:
 * 
 * 1. Duplex = Readable + Writable en un solo stream
 * 
 * 2. _write() se llama cuando alguien escribe:
 *    - Recibe: chunk, encoding, callback
 *    - DEBES llamar callback() al final
 *    - Aquí almacenas datos en el buffer interno
 * 
 * 3. _read() se llama cuando alguien quiere leer:
 *    - Recibe: size (sugerido)
 *    - Usa this.push(chunk) para enviar datos
 *    - this.push(null) indica fin del stream
 *    - Si no hay datos, simplemente no hagas push
 * 
 * 4. Buffer interno: Conecta el lado writable con readable
 *    - Los datos escritos van al buffer
 *    - Los datos leídos salen del buffer
 * 
 * 5. Los dos lados son INDEPENDIENTES:
 *    - Puedes escribir sin leer
 *    - Puedes leer sin escribir (si hay datos en buffer)
 *    - Funcionan a su propio ritmo
 * 
 * 6. Casos de uso reales:
 *    - Sockets TCP (comunicación bidireccional)
 *    - WebSockets
 *    - Transform streams (que son Duplex)
 *    - Wrapping de APIs no-streams
 */
