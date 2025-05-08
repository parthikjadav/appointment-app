function errorHandler(err, req, res, next) {
    if (res.headersSent) return 
    console.error(err.stack);
    res.status(500).send('Something broke!');
}
function notFoundHandler(req, res, next) {
    res.status(404).send('Not Found!');
}

module.exports = { errorHandler, notFoundHandler };