import random
import string
from django.core.cache import cache
from django.core.mail import send_mail
from django.conf import settings


OTP_EXPIRY_SECONDS = 600  # 10 minutes


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def store_otp(email, otp, user_data):
    """Store OTP + registration data in cache for 10 minutes."""
    key = f'otp:{email}'
    cache.set(key, {
        'otp': otp,
        'user_data': user_data,
    }, timeout=OTP_EXPIRY_SECONDS)


def verify_otp(email, otp_input):
    """Returns user_data if OTP is correct, None otherwise."""
    key = f'otp:{email}'
    cached = cache.get(key)
    if not cached:
        return None, 'OTP expired or not found'
    if cached['otp'] != otp_input.strip():
        return None, 'Invalid OTP'
    cache.delete(key)  # one-time use
    return cached['user_data'], None


def send_otp_email(email, otp, username):
    """Send branded Chatox OTP email."""
    subject = 'Your Chatox verification code'
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;min-height:100vh;">
        <tr>
          <td align="center" style="padding:40px 16px;">
            <table width="100%" style="max-width:480px;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1e40af,#2563eb,#3b82f6);padding:36px 32px;text-align:center;">
                    <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:8px;">
                        <div style="width:36px;height:2px;background:rgba(255,255,255,0.3);border-radius:2px;"></div>
                        <span style="font-size:11px;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:3px;text-transform:uppercase;">Chatox</span>
                        <div style="width:36px;height:2px;background:rgba(255,255,255,0.3);border-radius:2px;"></div>
                    </div>
                    <h1 style="font-size:32px;font-weight:900;color:white;letter-spacing:-1px;margin:0 0 8px;">Verify your email</h1>
                    <p style="color:#bfdbfe;margin:0;font-size:14px;font-weight:400;line-height:1.5;">One quick step to activate your Chatox account</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 32px;">
                  <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Hey <strong style="color:#e2e8f0;">@{username}</strong>,</p>
                  <p style="color:#94a3b8;font-size:14px;margin:0 0 32px;line-height:1.6;">
                    Welcome to Chatox! Use the code below to verify your email address.
                    This code expires in <strong style="color:#e2e8f0;">10 minutes</strong>.
                  </p>

                  <!-- OTP Box -->
                  <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:28px;text-align:center;margin-bottom:32px;">
                    <p style="color:#64748b;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
                    <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#2563eb;font-family:monospace;">
                      {otp}
                    </div>
                  </div>

                  <p style="color:#64748b;font-size:12px;margin:0;line-height:1.6;text-align:center;">
                    If you didn't create a Chatox account, you can safely ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;border-top:1px solid #334155;text-align:center;">
                  <p style="color:#475569;font-size:12px;margin:0;">
                    © 2026 Chatox Corp · Connect · Converse
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    plain_message = f"""
    Hey @{username},

    Your Chatox verification code is: {otp}

    This code expires in 10 minutes.

    If you didn't create a Chatox account, ignore this email.
    """

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )