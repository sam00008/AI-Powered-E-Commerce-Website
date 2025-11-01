import mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const mailGenarator = new mailgen({
        theme: "default",
        product: {
            name: "Gravity",
            link: "https://gravity.com",
        }
    });

    const emailTextual = mailGenarator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenarator.generate(options.mailgenContent);

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mail = {
        from: "Gravity.forgetPassword@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transport.sendMail(mail);
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("Email service failed. Make sure your credentials in .env are correct.");
        console.error("Error:", error); 
    }
}

// Forgot password Mailgen content generator
const forgotPasswordMailgenContent = (name, passwordResetUrl) => {
    return {
        body: {
            name: name,
            intro: "We received a request to reset the password for your account.",

            action: {
                instructions: "To reset your password, click the following button or link:",
                button: {
                    color: "rgba(9, 9, 43, 1)",
                    text: "Reset Password",
                    link: passwordResetUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, and we'll get back to you shortly."
        },
    }
}

export {
    forgotPasswordMailgenContent,
    sendEmail
}
