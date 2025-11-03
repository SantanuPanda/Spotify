const { SubscribeToQueue } = require("../broker/rabbit");
const sendEmail = require("../utils/email");

module.exports = async function startlisten() {
  SubscribeToQueue("USER_REGISTERED", async (data) => {
  const emailHTMLTemplate = `
    <div style="
        font-family: Arial, sans-serif; 
        background-color: #f4f6f8; 
        padding: 30px; 
        border-radius: 10px;
        color: #333;
    ">
      <div style="
          max-width: 600px; 
          margin: auto; 
          background-color: #ffffff; 
          padding: 20px; 
          border-radius: 10px; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      ">
        <h1 style="color: #4CAF50; text-align: center;">🎉 Welcome to Our Service! 🎉</h1>
        <p style="font-size: 16px;">Hi <strong>${data.fullname.firstname} ${data.fullname.lastname || ""}</strong>,</p>
        <p style="font-size: 16px;">We are thrilled to have you on board! Your role is: <strong style="color:#1E90FF;">${data.role}</strong></p>
        <p style="font-size: 16px;">Here’s what you can do next:</p>
        <ul style="font-size: 16px; line-height: 1.6;">
          <li>Explore our platform 🚀</li>
          <li>Update your profile 📝</li>
          <li>Start enjoying our services 🎯</li>
        </ul>
        <p style="font-size: 16px;">Thank you for joining us! We’re excited to see you grow with us. 😊</p>
        <p style="font-size: 16px; color: #777;">Best regards,<br/>The Team</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          © ${new Date().getFullYear()} Our Service. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendEmail(
    data.email,
    "🎉 Welcome to Our Service! 🎉",
    "Thank you for registering with us!",
    emailHTMLTemplate
  );
});
}

