# Mobile Dockerfile (for building APK)
FROM cirrusci/flutter:latest

WORKDIR /app

COPY . .

RUN flutter pub get
RUN flutter build apk --release

# Output APK
CMD ["cp", "build/app/outputs/flutter-apk/app-release.apk", "/output/app.apk"]