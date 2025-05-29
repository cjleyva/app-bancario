const { randomInt } = require('crypto');

function obtenerIPCliente(req) {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    return ip?.replace('::ffff:', ''); // limpia el prefijo IPv6 si aplica
}
function generarAccountNumber() {
    // Genera un número de 16 dígitos directamente
    const numeroDe16Digitos = Math.floor(
        1000000000000000 + Math.random() * 9000000000000000
    ).toString();

    return numeroDe16Digitos;
}

// Exportar las funciones para su uso en otros módulos
module.exports = {
    obtenerIPCliente,
    generarAccountNumber
};
