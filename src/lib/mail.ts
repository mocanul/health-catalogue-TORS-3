import nodemailer from "nodemailer"

//email signature used in all emails
const EMAIL_SIGNATURE = `
<p style="margin-top: 2rem; border-top: 1px solid #ddd; padding-top: 1rem;">
  <p>Kind Regards,<br/>
  TORS Team</p>
</p>
`

//check if .env variables exist
function requiredEnv(name: string): string {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`)
    }
    return value
}

function getTransporter() {
    return nodemailer.createTransport({
        host: requiredEnv("SMTP_HOST"),
        port: Number(requiredEnv("SMTP_PORT")),
        secure: false,
        auth: {
            user: requiredEnv("SMTP_USER"),
            pass: requiredEnv("SMTP_PASS"),
        },
    })
}

//function for sending email
//we can have multiple email functions for different purposes
export async function sendAccountCreatedEmail(params: {
    email: string
    firstName: string
    setupLink: string
    expires_at: Date
}) {
    const { email, firstName, setupLink } = params

    const transporter = getTransporter();

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Finish TORS account setup",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${firstName},</p>
        <p>Your account has been created. Finish your account setup using this link: <a href="${setupLink}">Set your password</a></p>
        ${EMAIL_SIGNATURE}
      </div>
    `,
    })
}

//email sent when user requests another password setup link
export async function sendRequestedPasswordSetupEmail(params: {
    email: string
    firstName: string
    setupLink: string
}) {
    const { email, firstName, setupLink } = params

    const transporter = getTransporter();
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
        ${EMAIL_SIGNATURE}
      </div>
    `,
    })
}

//email sent when user forgets account password
export async function sendForgotPasswordRequest(params: {
    email: string
    firstName: string
    setupLink: string
}) {
    const { email, firstName, setupLink } = params
    const transporter = getTransporter();
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: "TORS Password Reset",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${firstName},</p>
        <p>We have received a password reset request. If this wasn't you, please report this to our team.</p>
        <p>If this was you <a href="${setupLink}">reset your password here.</a></p>
        <p>Please do not share this link with anyone.</p>
        ${EMAIL_SIGNATURE}
      </div>
    `,
    })
}

export async function sendBookingReviewEmail(params: {
    email: string
    firstName: string
    status: "APPROVED" | "REJECTED"
    bookingTitle: string
    bookingDateLabel: string
    reviewNote?: string | null
}) {
    const { email, firstName, status, bookingTitle, bookingDateLabel, reviewNote } = params
    const transporter = getTransporter()
    const isApproved = status === "APPROVED"

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: isApproved
            ? "Your TORS booking has been approved"
            : "Your TORS booking has been declined",
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello ${firstName},</p>
        <p>Your booking for <strong>${bookingTitle}</strong> on <strong>${bookingDateLabel}</strong> has been ${isApproved ? "approved" : "declined"}.</p>
        ${!isApproved && reviewNote ? `<p><strong>Technician note:</strong> ${reviewNote}</p>` : ""}
        <p>You can sign in to TORS to check the latest booking status at any time.</p>
        ${EMAIL_SIGNATURE}
      </div>
    `,
    })
}
