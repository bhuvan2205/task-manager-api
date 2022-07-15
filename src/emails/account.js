const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMail = (email, name)=> {

    sgMail.send({
        to: email,
        from: 'bhuvan052000@gmail.com',
        subject: "Thanks for Joining us",
        text: `Hi, 
        \n 
        Welcome to the Task Manager App, ${name} 
        \n 
        Let me know how you get along with the app.
        \n
        Thanks,
        \n
        Task Manager App`
    })
}

const sendCancellationMail = (email, name)=> {

    sgMail.send({
        to: email,
        from: 'bhuvan052000@gmail.com',
        subject: "Sorry to See you Go!!",
        text: `GoodBye, 
        \n
        I hope see you again soon
        \n
        Thanks,
        \n
        Task Manager App`
    })
}


module.exports={
    sendWelcomeMail,
    sendCancellationMail
}