export function errorHandler (err, req, res, next) {
    console.log('err middleware',err);
    
    res.status(500).send({
        message: err?.message || err || "Error handler"
    })
  }