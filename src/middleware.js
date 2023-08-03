class AppError extends Error {
    constructor({status, message, errors = null}) {
        super(message)
        this.statusCode = status
        console.log({errors})
        this.errors = errors
        Error.captureStackTrace(this, this.constructor);
    }
}
const Middlewares = {
    log: (req, res, next) => {
        console.log(req.method + '@' + req.get('host') + req.originalUrl, req.ip, req.ips)
        next()
    },
    _catch: (fn) => {
        return (req, res, next) => {
            fn(req, res, next)
            .catch((e) => {
                return res.status(e.statusCode?e.statusCode:500).send({message:e.message, status:e.statusCode, errors:e.errors});
            })
        };
    },
    raise: c => {throw new AppError(c)}
}

module.exports = Middlewares