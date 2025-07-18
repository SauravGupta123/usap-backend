require("dotenv").config();
const nodemailer = require("nodemailer");

// Set up Nodemailer transport using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (user) => {
  const { email, firstName, ISAFid } = user;
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  console.log("Sending mail to: ", email);
  
  const emailSubject = "Welcome to Indian Student Assistance Portal France (ISAP-France)";
  const message = `Dear ${capitalizedFirstName},\n
  Welcome to ISAP-France! We are excited to have you on board.\n
  Your ISAP-France membership ID is: ${ISAFid}\n
  Please join our WhatsApp community: https://chat.whatsapp.com/JcvqATdPKPaJDCkKRhDz7w\n
  If you have any questions or need assistance, please don't hesitate to reach out to our support team.\n
  Best regards,
  Team ISAP-France`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: emailSubject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
  console.log("mail sent successfully");
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, message: 'Failed to send welcome email', error };
  }
};

const sendMailToAdmin = async (user, request) => {
  const { email, firstName, ISAFid } = user;
  const { requestFor, message } = request;
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const emailSubject = `New Request from ${capitalizedFirstName} (ID: ${ISAFid})`;

  // Use HTML content with proper formatting and clickable link
  const emailHtml = `
    <p>Dear Admin,</p>
    <p>You have received a new request from <strong>${capitalizedFirstName} (ID: ${ISAFid})</strong>.</p>
    <p><strong>Request Type:</strong> ${requestFor}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
    <p>Please address this request as soon as possible.</p>
    <p><a href="https://isafrance.org/admin/login/" target="_blank">Click here to view the request</a></p>
    <p>Best regards,<br>Team ISAP</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Admin email
    subject: emailSubject,
    html: emailHtml,  // Set HTML content for better formatting and clickable link
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Request email sent to admin successfully.' };
  } catch (error) {
    console.error('Error sending email to admin:', error);
    return { success: false, message: 'Failed to send email to admin.', error };
  }
};



const sendRequestResolvedMail = async (user, request) => {
  const { email, firstName, ISAFid } = user;
  const { requestFor, message, enquiryId } = request;
  const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const emailSubject = `Your Request Has Been Resolved`;

  // Use HTML content with clickable dashboard link
  const emailHtml = `
  <p>Dear ${capitalizedFirstName},</p>
  <p>We are pleased to inform you that your request (Request ID: <strong>${enquiryId}</strong>) has been successfully resolved.</p>
  <p><strong>Request Type:</strong> ${requestFor}</p>
  <p><strong>Details:</strong><br>${message}</p>
  <p>We truly appreciate your patience and cooperation throughout this process.</p>
  <p>To help us improve our services, we kindly request that you provide your feedback through the dashboard:</p>
  <p><a href="https://isafrance.org/login" target="_blank" style="color: #1a73e8;">Click here to access your dashboard</a></p>
  <p>Please join our WhatsApp community: <a href="https://chat.whatsapp.com/JcvqATdPKPaJDCkKRhDz7w" target="_blank">Click here to join</a></p>
  <p>Thank you for choosing ISAP-France! If you have any further questions or need assistance, feel free to reach out.</p>
  <p>Best regards,<br>Team ISAP-France</p>
`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: emailSubject,
    html: emailHtml,  // Set HTML content for clickable link
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Request resolved email sent successfully.' };
  } catch (error) {
    console.error('Error sending request resolved email:', error);
    return { success: false, message: 'Failed to send request resolved email.', error };
  }
};






module.exports = {sendMail, sendMailToAdmin, sendRequestResolvedMail};