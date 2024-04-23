export const errorHandler = (error, req, res, next) => {

  if (error) {
    if (error.codigo) {
      req.logger.error(  `(Error codigo ${error.codigoInterno}) - ${error.name}: ${error.message}. Detalle: ${error.descripcion}`
    );
      return res.status(error.codigo).json({ error: `${error.name}: ${error.message}` });
    } else {
      req.logger.fatal("error inesperado");
      return res.status(500).json({errorr:"Error inesperado en el servidor - Intente más tarde, o contacte a su administrador", msgError:error});
    }
  }
  next();
};

export const errorLoggers = (err, req, res, next) => {
  req.logger.error(err.stack);
  res.status(500).send("Something broke!");
};

export const ErrorSearchRouter = (req, res, next) => {
    if (!res.headersSent) { // Verificar si no se ha enviado una respuesta anteriormente
      req.logger.http("Ruta no encontrada");
      res.status(404).send("La ruta no se encontró");
    } else {
      next(); // Llamar a next() para pasar al siguiente middleware
    }
  };
  
