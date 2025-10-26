import 'package:flutter/material.dart';
import '../models/conversation.dart';
import '../services/conversation_service.dart';
import '../services/api_client.dart';

class ConversationProvider with ChangeNotifier {
  final ConversationService _conversationService = ConversationService();

  List<Conversation> _conversations = [];
  Conversation? _currentConversation;
  bool _isLoading = false;
  String? _error;

  List<Conversation> get conversations => _conversations;
  Conversation? get currentConversation => _currentConversation;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadConversations() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _conversations = await _conversationService.getConversations();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load conversations';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Conversation?> createConversation({String? title}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final conversation = await _conversationService.createConversation(
        title: title,
      );
      _conversations.insert(0, conversation);
      _currentConversation = conversation;
      _isLoading = false;
      notifyListeners();
      return conversation;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
      return null;
    } catch (e) {
      _error = 'Failed to create conversation';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<void> loadConversation(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentConversation = await _conversationService.getConversation(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load conversation';
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCurrentConversation(Conversation conversation) {
    _currentConversation = conversation;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
