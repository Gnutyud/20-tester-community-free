import { RequestStatus } from "@prisma/client";
import nodemailer from "nodemailer";

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Create a Nodemailer transporter with your SMTP configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL_ADDRESS,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "2FA Code",
    html: `<p>Your 2FA code: ${token}</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};

export const sendNotiNewMemberJoin = async (email: string, memberName: string) => {
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "New member join!",
    html: `<p>${memberName} has joined the group.</p>`,
  });
};

export const sendNotiDoneStep1 = async (email: string, groupId: number) => {
  const groupLink = `${domain}/group/${groupId}`;
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "All members are ready to start testing!",
    html: `<p>Your group test is ready to start the next step. Let's become testers for each other.</p><p>Click <a href="${groupLink}">here</a> to see all the members's app install URLs to help them test the app</p>`,
  });
};

export const sendNotiDoneStep2 = async (email: string, groupId: number) => {
  const groupLink = `${domain}/group/${groupId}`;
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "All members are already became testers!",
    html: `<p>Congratulations! You have almost completed the required 20 tests on Google Play. Just keep testing members's apps every day for 14 days from now.</p><p>Click <a href="${groupLink}">here</a> to see the group status and how many days remain until it is complete.</p>`,
  });
};

export const sendNotiDoneStep3 = async (email: string) => {
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: "Group test has been completed!",
    html: `<p>Congratulations! Your group test has been completed successfully. Thank you for using our service.</p>`,
  });
};

export const sendRequestBecameTesterEmail = async (
  email: string,
  groupId: number,
  requestUserName: string,
  imageUrl: string
) => {
  const groupLink = `${domain}/group/${groupId}`;
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: `Request to become a tester!`,
    html: `<p>${requestUserName} just asked you to confirm that he had installed the app.</p><p><img src=${imageUrl} alt="Screenshot of request evidence installed app"></p></p><p><a href="${groupLink}">Click here to the group test and look at the confirm tab</a></p>`,
  });
};

export const sendConfirmTesterEmail = async (
  email: string,
  groupId: number,
  actionType: RequestStatus,
  approvalUserName: string,
  approvalUserMail: string
) => {
  const groupLink = `${domain}/group/${groupId}`;
  await transporter.sendMail({
    from: "20 Tester Community <no-reply@20testercommunity.com>",
    to: email,
    subject: `Request to become a tester!`,
    html: `<p>${
      approvalUserName || ""
    }<${approvalUserMail}> ${actionType} you installed his app.</p><p><a href="${groupLink}">View group</a></p>`,
  });
};
