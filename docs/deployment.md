# Deployment Guide

This guide covers deploying HelpSync to production environments.

## Backend Deployment

### Docker Setup

1. Build the Docker image:

   ```bash
   cd backend
   docker build -t helpsync-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env helpsync-backend
   ```

### Heroku Deployment

1. Install Heroku CLI.
2. Login: `heroku login`
3. Create app: `heroku create helpsync-backend`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`

### AWS Deployment

- Use ECS for containerized deployment.
- Set up RDS for PostgreSQL.
- Use CloudWatch for logging.

## Mobile Deployment

### Android

- Build APK: `flutter build apk --release`
- Upload to Google Play Store.

### iOS

- Build IPA: `flutter build ios --release`
- Upload to App Store via Xcode or Transporter.

### Firebase

- Use Firebase for app distribution and crash reporting.

## Environment Variables

Required for backend:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API key
- `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`: Twilio credentials
- `GEMINI_API_KEY`: Google Gemini API key
- `NODE_ENV`: Set to 'production'

For mobile, configure API base URL in `lib/utils/constants.dart`.
