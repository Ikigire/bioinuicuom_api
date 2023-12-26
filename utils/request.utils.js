

function isRequestBodyPresent(req) {
    const body = req.body;

    return (body ? true : false);
}

module.exports = {
    isRequestBodyPresent
}