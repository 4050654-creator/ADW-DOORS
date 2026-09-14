const { Resend } = require("resend");

const escapeHtml = (value) => {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const sendContactMessage = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            message,
        } = req.body;

        // ===============================
        // VALIDATION
        // ===============================

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required.",
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required.",
            });
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address.",
            });
        }

        // ===============================
        // ENV CHECK
        // ===============================

        if (!process.env.RESEND_API_KEY) {
            console.error(
                "RESEND_API_KEY is missing from .env"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Email service is not configured.",
            });
        }

        if (!process.env.CONTACT_RECEIVER_EMAIL) {
            console.error(
                "CONTACT_RECEIVER_EMAIL is missing from .env"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Receiver email is not configured.",
            });
        }

        // ===============================
        // RESEND
        // ===============================

        const resend = new Resend(
            process.env.RESEND_API_KEY
        );

        // ===============================
        // CUSTOMER DATA
        // ===============================

        const customerName =
            escapeHtml(name.trim());

        const customerEmail =
            escapeHtml(email.trim());

        const customerPhone =
            phone && phone.trim()
                ? escapeHtml(phone.trim())
                : "Not provided";

        const customerMessage =
            escapeHtml(message.trim());

        const receivedAt =
            new Date().toLocaleString(
                "en-PK",
                {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Karachi",
                }
            );

        // ===============================
        // SEND EMAIL
        // ===============================

        const result =
            await resend.emails.send({
                from:
                    process.env.CONTACT_FROM_EMAIL ||
                    "ADW-STORE <onboarding@resend.dev>",

                to: [
                    process.env.CONTACT_RECEIVER_EMAIL,
                ],

                replyTo: email.trim(),

                subject:
                    `New Contact Message from ${name.trim()} - ADW-STORE`,

                html: `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    ADW-STORE Contact Message
  </title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f1f5f9;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
  "
>

  <!-- OUTER WRAPPER -->

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      background:#f1f5f9;
      padding:30px 12px;
    "
  >

    <tr>

      <td align="center">

        <!-- MAIN CARD -->

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:680px;
            background:#ffffff;
            border-radius:20px;
            overflow:hidden;
            box-shadow:
              0 12px 35px
              rgba(15,23,42,0.10);
          "
        >

          <!-- ================================= -->
          <!-- HEADER -->
          <!-- ================================= -->

          <tr>

            <td
              style="
                background:#0f172a;
                padding:34px 32px;
              "
            >

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >

                <tr>

                  <td>

                    <div
                      style="
                        display:inline-block;
                        background:#f97316;
                        color:#ffffff;
                        padding:8px 13px;
                        border-radius:10px;
                        font-size:12px;
                        font-weight:700;
                        letter-spacing:1px;
                      "
                    >
                      ADW
                    </div>

                    <h1
                      style="
                        margin:
                          14px 0 0;
                        color:#ffffff;
                        font-size:28px;
                        line-height:1.2;
                        font-weight:800;
                        letter-spacing:-0.5px;
                      "
                    >
                      ADW-STORE
                    </h1>

                    <p
                      style="
                        margin:
                          8px 0 0;
                        color:#cbd5e1;
                        font-size:14px;
                        line-height:1.6;
                      "
                    >
                      New customer message
                      received from your
                      Contact Us ADW-DOORS TEAM page.
                    </p>

                  </td>

                  <td
                    align="right"
                    valign="top"
                  >

                    <div
                      style="
                        background:#1e293b;
                        border:
                          1px solid
                          #334155;
                        border-radius:12px;
                        padding:
                          10px 13px;
                        color:#fed7aa;
                        font-size:11px;
                        font-weight:700;
                      "
                    >
                      NEW MESSAGE
                    </div>

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- ================================= -->
          <!-- ORANGE ACCENT -->
          <!-- ================================= -->

          <tr>

            <td
              style="
                height:4px;
                background:#f97316;
                font-size:0;
                line-height:0;
              "
            >
              &nbsp;
            </td>

          </tr>


          <!-- ================================= -->
          <!-- INTRO -->
          <!-- ================================= -->

          <tr>

            <td
              style="
                padding:
                  30px 32px 10px;
              "
            >

              <p
                style="
                  margin:0;
                  color:#64748b;
                  font-size:13px;
                  line-height:1.6;
                "
              >
                You have received a new
                message from a customer.
                Here are the submitted
                details:
              </p>

            </td>

          </tr>


          <!-- ================================= -->
          <!-- CUSTOMER DETAILS -->
          <!-- ================================= -->

          <tr>

            <td
              style="
                padding:
                  18px 32px 10px;
              "
            >

              <h2
                style="
                  margin:0 0 16px;
                  color:#0f172a;
                  font-size:19px;
                  font-weight:800;
                "
              >
                Customer Details
              </h2>


              <!-- NAME -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-bottom:10px;
                  background:#f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius:14px;
                "
              >

                <tr>

                  <td
                    style="
                      padding:16px;
                      width:42px;
                      font-size:20px;
                    "
                  >
                    👤
                  </td>

                  <td
                    style="
                      padding:16px 12px;
                    "
                  >

                    <div
                      style="
                        color:#94a3b8;
                        font-size:11px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:.7px;
                      "
                    >
                      Customer Name
                    </div>

                    <div
                      style="
                        margin-top:4px;
                        color:#0f172a;
                        font-size:15px;
                        font-weight:700;
                      "
                    >
                      ${customerName}
                    </div>

                  </td>

                </tr>

              </table>


              <!-- EMAIL -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-bottom:10px;
                  background:#f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius:14px;
                "
              >

                <tr>

                  <td
                    style="
                      padding:16px;
                      width:42px;
                      font-size:20px;
                    "
                  >
                    ✉️
                  </td>

                  <td
                    style="
                      padding:16px 12px;
                    "
                  >

                    <div
                      style="
                        color:#94a3b8;
                        font-size:11px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:.7px;
                      "
                    >
                      Email Address
                    </div>

                    <div
                      style="
                        margin-top:4px;
                        color:#0f172a;
                        font-size:15px;
                        font-weight:600;
                        word-break:break-word;
                      "
                    >
                      ${customerEmail}
                    </div>

                  </td>

                </tr>

              </table>


              <!-- PHONE -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-bottom:10px;
                  background:#f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius:14px;
                "
              >

                <tr>

                  <td
                    style="
                      padding:16px;
                      width:42px;
                      font-size:20px;
                    "
                  >
                    📱
                  </td>

                  <td
                    style="
                      padding:16px 12px;
                    "
                  >

                    <div
                      style="
                        color:#94a3b8;
                        font-size:11px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:.7px;
                      "
                    >
                      Phone Number
                    </div>

                    <div
                      style="
                        margin-top:4px;
                        color:#0f172a;
                        font-size:15px;
                        font-weight:600;
                      "
                    >
                      ${customerPhone}
                    </div>

                  </td>

                </tr>

              </table>


              <!-- TIME -->

              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-bottom:10px;
                  background:#f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius:14px;
                "
              >

                <tr>

                  <td
                    style="
                      padding:16px;
                      width:42px;
                      font-size:20px;
                    "
                  >
                    🕐
                  </td>

                  <td
                    style="
                      padding:16px 12px;
                    "
                  >

                    <div
                      style="
                        color:#94a3b8;
                        font-size:11px;
                        font-weight:700;
                        text-transform:uppercase;
                        letter-spacing:.7px;
                      "
                    >
                      Received
                    </div>

                    <div
                      style="
                        margin-top:4px;
                        color:#0f172a;
                        font-size:15px;
                        font-weight:600;
                      "
                    >
                      ${receivedAt}
                    </div>

                  </td>

                </tr>

              </table>

            </td>

          </tr>


          <!-- ================================= -->
          <!-- MESSAGE -->
          <!-- ================================= -->

          <tr>

            <td
              style="
                padding:
                  24px 32px;
              "
            >

              <div
                style="
                  background:#fff7ed;
                  border:
                    1px solid #fed7aa;
                  border-left:
                    5px solid #f97316;
                  border-radius:14px;
                  padding:22px;
                "
              >

                <div
                  style="
                    color:#9a3412;
                    font-size:11px;
                    font-weight:800;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    margin-bottom:10px;
                  "
                >
                  CUSTOMER MESSAGE
                </div>

                <div
                  style="
                    color:#431407;
                    font-size:15px;
                    line-height:1.8;
                    white-space:pre-wrap;
                    word-break:break-word;
                  "
                >
                  ${customerMessage}
                </div>

              </div>

            </td>

          </tr>


          <!-- ================================= -->
          <!-- REPLY BUTTON -->
          <!-- ================================= -->

          <tr>

            <td
              align="center"
              style="
                padding:
                  4px 32px 30px;
              "
            >

              <a
                href="mailto:${escapeHtml(email.trim())}"
                style="
                  display:inline-block;
                  background:#f97316;
                  color:#ffffff;
                  text-decoration:none;
                  font-size:14px;
                  font-weight:800;
                  padding:
                    14px 24px;
                  border-radius:12px;
                "
              >
                Reply to Customer →
              </a>

            </td>

          </tr>


          <!-- ================================= -->
          <!-- FOOTER -->
          <!-- ================================= -->

          <tr>

            <td
              style="
                background:#0f172a;
                padding:
                  24px 32px;
                text-align:center;
              "
            >

              <div
                style="
                  color:#ffffff;
                  font-size:16px;
                  font-weight:800;
                  letter-spacing:.3px;
                "
              >
                ADW-STORE
              </div>

              <div
                style="
                  margin-top:7px;
                  color:#94a3b8;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                Customer Support Notification
              </div>

              <div
                style="
                  margin-top:14px;
                  color:#64748b;
                  font-size:11px;
                "
              >
                This email was generated
                automatically from the
                ADW-STORE Contact Us form.
              </div>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
        `,
            });

        // ===============================
        // SUCCESS LOG
        // ===============================

        console.log(
            "Contact email sent successfully:",
            result
        );

        return res.status(200).json({
            success: true,
            message:
                "Your message has been sent successfully.",
        });

    } catch (error) {

        // ===============================
        // ERROR
        // ===============================

        console.error(
            "CONTACT EMAIL ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                "Unable to send your message right now.",
        });
    }
};

module.exports = {
    sendContactMessage,
};

