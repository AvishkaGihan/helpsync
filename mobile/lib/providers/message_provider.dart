import 'dart:async';
import 'package:flutter/material.dart';
import '../models/message.dart';
import '../services/conversation_service.dart';
import '../services/socket_service.dart';
import '../services/api_client.dart';

class MessageProvider with ChangeNotifier {
  final ConversationService _conversationService = ConversationService();
  final SocketService _socketService = SocketService();
  final StreamController<Map<String, dynamic>> _escalationController =
      StreamController<Map<String, dynamic>>.broadcast();

  List<Message> _messages = [];
  bool _isLoading = false;
  bool _isTyping = false;
  String? _error;

  List<Message> get messages => _messages;
  bool get isLoading => _isLoading;
  bool get isTyping => _isTyping;
  String? get error => _error;
  bool get isConnected => _socketService.isConnected;
  Stream<Map<String, dynamic>> get escalationStream =>
      _escalationController.stream;

  MessageProvider() {
    _initializeSocketListeners();
  }

  void _initializeSocketListeners() {
    _socketService.messageStream.listen((message) {
      _messages.add(message);
      _isTyping = false;
      notifyListeners();
    });

    _socketService.typingStream.listen((data) {
      if (data['senderType'] == 'AI') {
        _isTyping = true;
        notifyListeners();
      }
    });

    _socketService.escalationStream.listen((data) {
      _escalationController.add(data);
      notifyListeners();
    });
  }

  Future<void> connectSocket() async {
    try {
      await _socketService.connect();
    } catch (e) {
      _error = 'Failed to connect to chat';
      notifyListeners();
    }
  }

  void disconnectSocket() {
    _socketService.disconnect();
  }

  Future<void> loadMessages(String conversationId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _messages = await _conversationService.getMessages(conversationId);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load messages';
      _isLoading = false;
      notifyListeners();
    }
  }

  void joinConversation(String conversationId) {
    _socketService.joinConversation(conversationId);
  }

  void sendMessage(String conversationId, String content) {
    // Optimistic UI update
    final tempMessage = Message(
      id: 'temp-${DateTime.now().millisecondsSinceEpoch}',
      conversationId: conversationId,
      senderType: 'USER',
      content: content,
      createdAt: DateTime.now(),
    );

    _messages.add(tempMessage);
    _isTyping = true;
    notifyListeners();

    _socketService.sendMessage(conversationId, content);
  }

  void sendTyping(String conversationId) {
    _socketService.sendTyping(conversationId);
  }

  void clearMessages() {
    _messages = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _socketService.dispose();
    _escalationController.close();
    super.dispose();
  }
}
