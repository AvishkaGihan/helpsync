# HelpSync Mobile App

The HelpSync mobile app is built with Flutter, providing a cross-platform experience for users to access support features on-the-go.

## Features

- Real-time chat with support agents
- Access to knowledge base articles
- User profile management
- Push notifications for updates

## Architecture

- **State Management**: Provider pattern for managing app state.
- **Services**: API calls handled in `services/` directory.
- **Screens**: UI components in `screens/` for different views.
- **Widgets**: Reusable UI elements in `widgets/`.
- **Models**: Data models in `models/`.
- **Utils**: Helper functions and constants.

## Build Instructions

### Prerequisites

- Flutter SDK (latest stable)
- Android Studio or Xcode for emulators

### Setup

1. Ensure Flutter is installed: `flutter doctor`
2. Navigate to mobile directory: `cd mobile`
3. Get dependencies: `flutter pub get`
4. Run on device/emulator: `flutter run`

### Building for Production

- Android APK: `flutter build apk --release`
- iOS: `flutter build ios --release` (requires Xcode)

## User Guide

1. **Login**: Enter email and password to access the app.
2. **Chat**: Start a conversation with support.
3. **Knowledge Base**: Browse FAQs and guides.
4. **Profile**: Update personal information.

For developers, refer to the main README for overall setup.
