const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});

async function sendEmail(recipient, subject, body) {
    return ses.send(new SendEmailCommand({
        Destination: {
            ToAddresses: [recipient],
        },
        Message: {
            Body: {
                Text: {
                    Data: body,
                },
            },
            Subject: {
                Data: subject,
            },
        },
        Source: "noreply@tlembedded.com",
    }));
}

exports.sendEmail = sendEmail