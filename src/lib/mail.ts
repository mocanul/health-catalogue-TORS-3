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
//we can have multiple function for multiple purposes
export async function sendAccountCreatedEmail(params: {
    email: string
    firstName: string
}) {
    const { email, firstName } = params

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Your TORS account has been created",

        //email is formatted with html
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to TORS</h2>
            <p>Hello ${firstName ?? "User"},</p>
            <p>Your account has been successfully created.</p>
            <p>You can now log in using your university email.</p>
            <br/>
            <p>Regards,<br/>TORS Team</p>
        </div>
        `,
    })
}

