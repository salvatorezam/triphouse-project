const crypto = require('crypto');

exports.generateSalt = function () {
    return crypto.randomBytes(16).toString('hex').slice(0,32);
}

exports.sha512 = function (password, salt) {
    let hash = crypto.createHmac('sha512', salt); 
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};