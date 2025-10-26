class AppConstants {
  // API URLs
  static const String backendUrl = 'http://localhost:3000/api';
  static const String socketUrl = 'http://localhost:3000';

  // For iOS Simulator use localhost
  // For Android Emulator use: 'http://10.0.2.2:3000'
  // For Physical Device use your computer's IP: 'http://192.168.1.100:3000'

  // API Endpoints
  static const String authRegister = '$backendUrl/auth/register';
  static const String authLogin = '$backendUrl/auth/login';
  static const String authProfile = '$backendUrl/auth/profile';
  static const String conversations = '$backendUrl/conversations';
  static const String knowledgeBase = '$backendUrl/knowledge-base';
  static const String knowledgeBaseSearch = '$backendUrl/knowledge-base/search';

  // Storage Keys
  static const String tokenKey = 'jwt_token';
  static const String userKey = 'user_data';

  // Pagination
  static const int messagesPerPage = 50;
  static const int conversationsPerPage = 20;
}
