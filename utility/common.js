
const responseHandler = (res, status, message, result) => {
    return res.json({status, message, result});
}

module.exports = {
    responseHandler
}