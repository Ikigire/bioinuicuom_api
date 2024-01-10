const bcrypt = require('bcrypt');


function validatePassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

function encryptPassword(password) {
    const salt = bcrypt.genSaltSync(10, 'a');
    password = bcrypt.hashSync(password, salt)
    return password;
}

module.exports = {
    validatePassword,
    encryptPassword
}