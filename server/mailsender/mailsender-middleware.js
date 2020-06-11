var nodemailer = require('nodemailer'); // è necessario?

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

exports.inviaMailCliente = async function (transporter, mailReceiver, testo) {
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

exports.inviaMailPagamento = async function (transporter, mailReceiver, testo) {
    let mailOptions = {
        from: 'triphousetz@gmail.com',
        to: mailReceiver,
        subject: 'Pagamento avvenuto!',
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

exports.inviaMailConferma = async function (transporter, mailReceiver, testo) {
    let mailOptions = {
        from: 'triphousetz@gmail.com',
        to: mailReceiver,
        subject: 'Prenotazione confermata!',
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

exports.inviaMailDeclinazione = async function (transporter, mailReceiver, testo) {
    let mailOptions = {
        from: 'triphousetz@gmail.com',
        to: mailReceiver,
        subject: 'Prenotazione declinata!',
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



