# HelpSync

HelpSync is a comprehensive help synchronization platform that enables seamless communication, knowledge management, and payment processing for support teams and users. It integrates real-time chat, analytics, knowledge bases, and secure payments to streamline customer support workflows.

## Features

- **Real-time Conversations**: Socket-based chat for instant messaging between users and support agents.
- **Knowledge Base**: Centralized repository for FAQs, guides, and resources.
- **Analytics Dashboard**: Insights into conversation metrics, user engagement, and performance.
- **Payment Integration**: Secure payment processing via Stripe for subscriptions or transactions.
- **Admin Panel**: Web-based admin interface for managing conversations, users, and content.
- **Mobile App**: Flutter-based mobile application for on-the-go access.
- **Authentication**: JWT-based secure login and role-based access control.
- **Notifications**: SMS notifications via Twilio for alerts.

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js, Prisma (ORM), PostgreSQL
- **Frontend (Admin)**: EJS templates, HTML/CSS/JS
- **Mobile**: Flutter (Dart)
- **Services**: Stripe (payments), Twilio (SMS), Gemini (AI services)
- **DevOps**: Docker, GitHub Actions (CI/CD)

## Installation

### Prerequisites

- Node.js (v18+)
- Flutter SDK
- PostgreSQL
- Git

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/AvishkaGihan/helpsync.git
   cd helpsync/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in `backend/` with:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/helpsync"
   JWT_SECRET="your-secret-key"
   STRIPE_SECRET_KEY="sk_test_..."
   TWILIO_ACCOUNT_SID="..."
   TWILIO_AUTH_TOKEN="..."
   GEMINI_API_KEY="..."
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Mobile Setup

1. Navigate to mobile directory:

   ```bash
   cd ../mobile
   ```

2. Install dependencies:

   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

## Usage

- **Backend API**: Access at `http://localhost:3000`. See API docs for endpoints.
- **Admin Panel**: Visit `http://localhost:3000/admin` after logging in.
- **Mobile App**: Run on emulator or device for user interactions.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add some feature'`.
4. Push to branch: `git push origin feature/your-feature`.
5. Open a pull request.

### Code Style

- Use ESLint and Prettier for backend.
- Follow Flutter's style guide for mobile.
- Write tests for new features.

## Documentation

- [API Docs](http://localhost:3000/api-docs) (when running locally)
- [Deployment Guide](docs/deployment.md)
- [Privacy Policy](docs/privacy-policy.md)
- [Terms of Service](docs/terms-of-service.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
