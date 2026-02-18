import nodemailer from "nodemailer"

//host, port and auth are taken from .env file
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, //true only if using port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

//check if .env variables exist, preventing run time errors
function requiredEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`)
    }
    return value
}

//validate email configuration
requiredEnv("SMTP_HOST")
requiredEnv("SMTP_PORT")
requiredEnv("SMTP_USER")
requiredEnv("SMTP_PASS")
requiredEnv("SMTP_FROM")

//function for sending email
//we can have multiple email functions for different purposes
export async function sendAccountCreatedEmail(params: {
    email: string
    firstName: string
    setupLink: string
    expires_at: Date
}) {
    const { email, firstName, setupLink } = params

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Finish TORS account setup",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${firstName},</p>
        <p>Your account has been created. Finish your account setup using this link: <a href="${setupLink}">Set your password</a></p>
      </div>
    `,
    })
}

export async function sendRequestedPasswordSetupEmail(params: {
    email: string
    firstName: string
    setupLink: string
}) {
    const { email, firstName, setupLink } = params

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "TORS Password Setup Request",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${firstName},</p>
        <p>Password setup request bas been received, please see link to setup your password: <a href="${setupLink}">Set your password</a></p>
        <p>Please do not share this link with anyone</p>
        <p>If you did not submit this request, please report this to our team, thank you.</p>
      </div>
    `,
    })
}



