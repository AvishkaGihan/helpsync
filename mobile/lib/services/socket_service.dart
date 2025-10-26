import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../models/message.dart';
import 'auth_service.dart';
import '../utils/constants.dart';

class SocketService {
  io.Socket? _socket;
  final AuthService _authService = AuthService();

  final StreamController<Message> _messageController =
      StreamController<Message>.broadcast();
  final StreamController<Map<String, dynamic>> _typingController =
      StreamController<Map<String, dynamic>>.broadcast();
  final StreamController<Map<String, dynamic>> _escalationController =
      StreamController<Map<String, dynamic>>.broadcast();
  final StreamController<bool> _connectionController =
      StreamController<bool>.broadcast();

  Stream<Message> get messageStream => _messageController.stream;
  Stream<Map<String, dynamic>> get typingStream => _typingController.stream;
  Stream<Map<String, dynamic>> get escalationStream =>
      _escalationController.stream;
  Stream<bool> get connectionStream => _connectionController.stream;

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    if (_socket?.connected ?? false) return;

    final token = await _authService.getToken();
    if (token == null) {
      throw Exception('No authentication token found');
    }

    _socket = io.io(
      AppConstants.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .enableAutoConnect()
          .build(),
    );

    _socket!.onConnect((_) {
      _log('Socket connected');
      _connectionController.add(true);
    });

    _socket!.onDisconnect((_) {
      _log('Socket disconnected');
      _connectionController.add(false);
    });

    _socket!.on('new_message', (data) {
      final message = Message.fromJson(data);
      _messageController.add(message);
    });

    _socket!.on('typing_indicator', (data) {
      _typingController.add(data);
    });

    _socket!.on('conversation_escalated', (data) {
      _escalationController.add(data);
    });

    _socket!.on('error', (data) {
      _log('Socket error: $data');
    });

    _socket!.connect();
  }

  void _log(String message) {
    // Debug logging - can be toggled or sent to a logging service
    // ignore: avoid_print
    print('[SocketService] $message');
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }

  void joinConversation(String conversationId) {
    _socket?.emit('join_conversation', {'conversationId': conversationId});
  }

  void sendMessage(String conversationId, String content) {
    _socket?.emit('send_message', {
      'conversationId': conversationId,
      'content': content,
    });
  }

  void sendTyping(String conversationId) {
    _socket?.emit('typing', {'conversationId': conversationId});
  }

  void dispose() {
    disconnect();
    _messageController.close();
    _typingController.close();
    _escalationController.close();
    _connectionController.close();
  }
}
