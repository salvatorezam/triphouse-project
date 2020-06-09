var nodemailer = require('nodemailer'); 
exports.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'triphousetz@gmail.com',
        pass: 'Unipa2020'
    }
})