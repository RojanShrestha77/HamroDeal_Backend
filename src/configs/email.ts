import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_PASS = process.env.EMAIL_PASS as string;
const EMAIL_USER = process.env.EMAIL_USER as string;

console.log('🔍 Email Config Check:');
console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASS:', EMAIL_PASS ? '✅ Set' : '❌ Missing');

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error('Email credentials are not configured. Please check EMAIL_USER and EMAIL_PASS in .env file');
        }

        const mailOptions = {
            from: `Mero app <${EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        console.log('📧 Attempting to send email to:', to);
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return result;
    } catch (error: any) {
        console.error('❌ Email sending failed:', error.message);
        throw error;
    }
}