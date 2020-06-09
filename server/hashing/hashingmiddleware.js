const crypto = require('crypto');

exports.sha512 = function (password) {
    let salt = crypto.randomBytes(16).toString('hex').slice(0,32);
    let hash = crypto.createHmac('sha512', salt); 
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};