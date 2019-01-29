//const nodemailer = require('nodemailer');
module.exports = {

    email: function (params = { to: 'email', subject: 'cmpe133', text: 'some text here' }) {
        var nodemailer = require('nodemailer');
        //parameter: { subject: "cmpe133", text: "some text here", header:"header1"....

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {

                user: 'sjsu.m.safeway@gmail.com',

                pass: 'testbug123'



            }

        });

        var mailOptions = {

            from: 'sjsu.m.safeway@gmail.com',

            to: params.to,

            subject: params.subject,

            text: params.text,

            //headers: params.header

        }

        transporter.sendMail(mailOptions, function (error, info) {

            if (error) {

                console.log(error);
                console.log(params.to)
                console.log(params.subject)
                console.log(params.text)

            } else {

                console.log('Email sent: ' + info.response);

            }

        });

    }
};