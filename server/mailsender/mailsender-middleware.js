var nodemailer = require('nodemailer'); 

exports.sendRegistrationEmail = async function (transporter, mailReceiver) {
    let mailOptions = {
        from: 'triphousetz@gmail.com',
        to: mailReceiver,
        subject: 'Benvenuto in Triphouse!',
        text: 'Ma cu tu fici fari?'
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) 
                return reject(error);
            console.log('Email sent: ' + info.response);
            resolve('Email sent');
            });
        }); 
};

exports.inviaMailHost = async function (transporter, mailReceiver, testo) {
    let mailOptions = {
        from: 'triphousetz@gmail.com',
        to: mailReceiver,
        subject: 'Prenotazione annullata!',
        text: testo
    }
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) 
                return reject(error);
            console.log('Email sent: ' + info.response);
            resolve('Email sent');
            });
        }); 
};

