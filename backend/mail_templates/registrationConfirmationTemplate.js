export const registrationTemplate = (name, role) => {
  const is_admin = role === "admin";

  const welcomeTitle = is_admin
    ? "Admin Account Created!"
    : "Welcome to JobHunters!";

  const welcomeMessage = is_admin
    ? "Your <strong>Admin Account</strong> has been successfully created. You can now log in and access the admin panel and all site management tools."
    : "Your account has been successfully created. You can now log in.";

  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${welcomeTitle}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  width: 90%;
                  max-width: 600px;
                  margin: 20px auto;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  overflow: hidden;
              }
              .header {
                  background-color: #f4f4f4;
                  padding: 20px;
                  text-align: center;
              }
              .header h1 {
                  margin: 0;
                  color: #007bff;
              }
              .content {
                  padding: 30px;
              }
              .content p {
                  margin-bottom: 20px;
              }
              .button {
                  display: inline-block;
                  background-color: #007bff;
                  color: #ffffff;
                  padding: 12px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
              }
              .footer {
                  background-color: #f9f9f9;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #777;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${welcomeTitle}</h1>
              </div>
              <div class="content">
                  <p>Hi ${name},</p>
                  <p>Thank you for registering! ${welcomeMessage}</p>
                  <a href="http://localhost:5173/login" class="button">
                    ${is_admin ? "Go to Admin Panel" : "Start Now"}
                  </a>
                  <p style="margin-top: 30px;">Happy Coding!</p>
                  <p>— The AlgoPractise Team</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} JobHunters. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
};
