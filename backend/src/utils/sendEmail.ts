import nodemailer from "nodemailer";
import { appConfig } from "../config/index.config";
import { logger } from "./logger.utils";

interface IEmail {
  email: string;
  subject: string;
  html?: string;
  text?: string;
  name?: string;
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

export const connectSMTPAccount = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: appConfig.smtp.host,
      port: Number(appConfig.smtp.port),
      secure: false,
      auth: {
        user: appConfig.smtp.user,
        pass: appConfig.smtp.password,
      },
    });

    return transporter;
  } catch (error) {
    throw new Error(`Failed to connect to SMTP server: ${getErrorMessage(error)}`);
  }
};

export const sendEmail = async (emailData: IEmail) => {
  try {
    const transporter = connectSMTPAccount();
    const mailOptions = {
      from: appConfig.smtp.user,
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${emailData.email}`);

    return { message: "Email sent", info };
  } catch (error) {
    const message = getErrorMessage(error);
    logger.error(`Error sending email: ${message}`);
    throw new Error(`Failed to send email: ${message}`);
  }
};
