const template = (msg) => {
    return `
     <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Appointment Notification</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <tr>
              <td align="center" style="padding-bottom: 20px;">
                <!-- Inline SVG icon -->
                <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="#6366f1"/>
                  <path d="M24 12v12l8 4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; color: #111827; font-size: 22px; font-weight: 600; padding-bottom: 10px;">
                Appointment Notification
              </td>
            </tr>
            <tr>
              <td style="text-align: center; color: #4b5563; font-size: 16px; line-height: 1.6; padding-bottom: 30px;">
                ${msg}
              </td>
            </tr>
            <tr>
              <td style="text-align: center; font-size: 14px; color: #9ca3af;">
                Thanks,<br/>
                <strong style="color: #6b7280;">Schedular Team</strong>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `;
};

module.exports = template;
