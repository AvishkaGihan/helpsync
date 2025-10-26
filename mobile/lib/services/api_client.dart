import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String code;
  final String message;
  final int statusCode;

  ApiException({
    required this.code,
    required this.message,
    required this.statusCode,
  });

  @override
  String toString() => message;
}

class ApiClient {
  final Future<String?> Function() _getTokenCallback;

  ApiClient({Future<String?> Function()? getTokenCallback})
    : _getTokenCallback = getTokenCallback ?? (() => Future.value(null));

  Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = {'Content-Type': 'application/json'};

    if (includeAuth) {
      final token = await _getTokenCallback();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  Future<T> get<T>(
    String url, {
    bool requiresAuth = true,
    T Function(dynamic)? parser,
  }) async {
    try {
      final headers = await _getHeaders(includeAuth: requiresAuth);
      print('API Request: GET $url'); // Debug logging
      final response = await http
          .get(Uri.parse(url), headers: headers)
          .timeout(
            const Duration(seconds: 30),
            onTimeout: () {
              throw ApiException(
                code: 'TIMEOUT',
                message: 'Request timeout - cannot connect to server',
                statusCode: 0,
              );
            },
          );
      print('Response Status: ${response.statusCode}'); // Debug logging
      return _handleResponse(response, parser);
    } on ApiException {
      rethrow;
    } catch (e) {
      print('API Error: $e'); // Debug logging
      throw ApiException(
        code: 'NETWORK_ERROR',
        message: 'Network error: ${e.toString()}',
        statusCode: 0,
      );
    }
  }

  Future<T> post<T>(
    String url,
    Map<String, dynamic> body, {
    bool requiresAuth = true,
    T Function(dynamic)? parser,
  }) async {
    try {
      final headers = await _getHeaders(includeAuth: requiresAuth);
      print('API Request: POST $url'); // Debug logging
      print('Body: $body'); // Debug logging
      final response = await http
          .post(Uri.parse(url), headers: headers, body: jsonEncode(body))
          .timeout(
            const Duration(seconds: 30),
            onTimeout: () {
              throw ApiException(
                code: 'TIMEOUT',
                message: 'Request timeout - cannot connect to server',
                statusCode: 0,
              );
            },
          );
      print('Response Status: ${response.statusCode}'); // Debug logging
      print('Response Body: ${response.body}'); // Debug logging
      return _handleResponse(response, parser);
    } on ApiException {
      rethrow;
    } catch (e) {
      print('API Error: $e'); // Debug logging
      throw ApiException(
        code: 'NETWORK_ERROR',
        message: 'Network error: ${e.toString()}',
        statusCode: 0,
      );
    }
  }

  Future<T> patch<T>(
    String url,
    Map<String, dynamic> body, {
    bool requiresAuth = true,
    T Function(dynamic)? parser,
  }) async {
    try {
      final headers = await _getHeaders(includeAuth: requiresAuth);
      final response = await http.patch(
        Uri.parse(url),
        headers: headers,
        body: jsonEncode(body),
      );
      return _handleResponse(response, parser);
    } catch (e) {
      throw ApiException(
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        statusCode: 0,
      );
    }
  }

  Future<void> delete(String url, {bool requiresAuth = true}) async {
    try {
      final headers = await _getHeaders(includeAuth: requiresAuth);
      final response = await http.delete(Uri.parse(url), headers: headers);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return;
      }

      throw _parseError(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
        statusCode: 0,
      );
    }
  }

  T _handleResponse<T>(http.Response response, T Function(dynamic)? parser) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (parser != null) {
        final data = jsonDecode(response.body);
        return parser(data);
      }
      return jsonDecode(response.body) as T;
    }

    throw _parseError(response);
  }

  ApiException _parseError(http.Response response) {
    try {
      final error = jsonDecode(response.body)['error'];
      return ApiException(
        code: error['code'] ?? 'UNKNOWN_ERROR',
        message: error['message'] ?? 'An error occurred',
        statusCode: response.statusCode,
      );
    } catch (e) {
      return ApiException(
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        statusCode: response.statusCode,
      );
    }
  }
}
