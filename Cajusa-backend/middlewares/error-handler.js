const { isCelebrateError } = require("celebrate");

module.exports = (err, req, res, next) => {
  if (err.name === "ValidationError" || err.name === "CastError") {
    err.statusCode = 400;
    err.message = err.name === "CastError" ? "ID inválido" : "Datos inválidos";
  }

  if (err.name === "DocumentNotFoundError") {
    err.statusCode = 404;
    err.message = "Recurso no encontrado";
  }

  if (err.code === 11000) {
    err.statusCode = 409;

    if (err.keyPattern?.email) err.message = "Ese correo ya está registrado";
    else if (err.keyPattern?.phone)
      err.message = "Ese teléfono ya está registrado";
    else if (err.keyPattern?.nickname)
      err.message = "Ese nickname ya está registrado";
    else if (err.keyPattern?.code)
      err.message = "Ese código de producto ya está registrado";
    else err.message = "Dato duplicado";
  }

  if (isCelebrateError(err)) {
    err.statusCode = 400;
    err.message = "Datos inválidos";
  }

  const { statusCode = 500 } = err;
  const message =
    statusCode === 500 ? "Error interno del servidor" : err.message;

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ message });
};
