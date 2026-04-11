# SMS Alert Broadcasting Setup

This document explains how to set up and test SMS alert broadcasting for the MoonsuLink platform.

## Overview

Alerts are broadcasted to users via SMS using Twilio. The system supports:
- Multi-language messages (English/French)
- Severity indicators with emojis
- Regional targeting
- Advice/recommendation fields
- Automatic message splitting for long content

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 2. Get Twilio Credentials

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase or use a trial phone number for sending SMS

## How It Works

### Broadcasting Flow

1. **Admin publishes alert** via admin panel
2. **API endpoint** `/alerts/:id/publish` is called
3. **Alert status** updated to "published"
4. **Broadcast triggered** to all registered users
5. **Channel selection** (priority: Telegram → WhatsApp → SMS)
6. **SMS sent** via Twilio to users with phone numbers

### Message Format

```
🚨 CRITICAL ALERT (Douala)

Alert Title

Alert message content here...

*Recommendation:* Advice for users
```

### User Requirements

Users must have a `phone` field in their profile to receive SMS alerts.

## Testing

### 1. Create Test Users

Add users with phone numbers to the database:

```sql
INSERT INTO users (name, phone, region, role, lang, verified)
VALUES ('Test User', '+1234567890', 'Douala', 'farmer', 'en', true);
```

### 2. Create and Publish Alert

1. Use the admin panel to create an alert
2. Add title, message, severity, region, and advice
3. Click "Publish" to broadcast

### 3. Run Test Script

```bash
npm run test:sms
```

This will broadcast the most recently published alert to all users with phone numbers.

## Monitoring

### Logs

Check server logs for:
- `[SMS] Twilio not configured` - Missing environment variables
- `[SMS] Send failed:` - Twilio API errors
- `[Broadcast] Failed to send alert to user` - Individual user failures

### Twilio Dashboard

Monitor sent messages and delivery status at [Twilio Console](https://console.twilio.com/).

## Troubleshooting

### Common Issues

1. **"Twilio not configured"** - Check environment variables
2. **"Send failed"** - Verify Twilio credentials and phone number
3. **No SMS received** - Check phone number format (+country code)
4. **Message too long** - System automatically splits messages

### Message Limits

- SMS messages are split at 155 characters
- Multi-part messages include numbering (1/2, 2/2)
- Unicode characters count as 1-2 characters each

## Future Enhancements

- Telegram broadcasting (requires bot token setup)
- WhatsApp broadcasting (requires Meta Business API)
- Delivery receipts and status tracking
- Opt-in/opt-out user preferences