import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import 'api_client.dart';
import '../utils/constants.dart';

class AuthService {
  late final ApiClient _apiClient;

  AuthService() {
    _apiClient = ApiClient(getTokenCallback: getToken);
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.tokenKey, token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  Future<void> _saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.userKey, jsonEncode(user.toJson()));
  }

  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(AppConstants.userKey);
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  Future<User> register(
    String email,
    String password, {
    String role = 'CUSTOMER',
  }) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        AppConstants.authRegister,
        {'email': email, 'password': password, 'role': role},
        requiresAuth: false,
      );

      final user = User.fromJson(response['user']);
      await _saveUser(user);

      return user;
    } catch (e) {
      rethrow;
    }
  }

  Future<User> login(String email, String password) async {
    try {
      final response = await _apiClient.post<Map<String, dynamic>>(
        AppConstants.authLogin,
        {'email': email, 'password': password},
        requiresAuth: false,
      );

      final token = response['token'] as String;
      final user = User.fromJson(response['user']);

      await _saveToken(token);
      await _saveUser(user);

      return user;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.tokenKey);
    await prefs.remove(AppConstants.userKey);
  }

  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null;
  }

  Future<User> getProfile() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      AppConstants.authProfile,
    );

    final user = User.fromJson(response);
    await _saveUser(user);

    return user;
  }
}
