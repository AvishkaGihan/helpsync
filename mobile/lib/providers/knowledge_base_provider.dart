import 'package:flutter/material.dart';
import '../models/knowledge_base_article.dart';
import '../services/knowledge_base_service.dart';
import '../services/api_client.dart';

class KnowledgeBaseProvider with ChangeNotifier {
  final KnowledgeBaseService _knowledgeBaseService = KnowledgeBaseService();

  List<KnowledgeBaseArticle> _articles = [];
  List<KnowledgeBaseArticle> _filteredArticles = [];
  KnowledgeBaseArticle? _currentArticle;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';

  List<KnowledgeBaseArticle> get articles =>
      _searchQuery.isEmpty ? _articles : _filteredArticles;
  KnowledgeBaseArticle? get currentArticle => _currentArticle;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  Future<void> loadArticles() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _articles = await _knowledgeBaseService.getArticles();
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load articles';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchArticles(String query) async {
    _searchQuery = query;

    if (query.isEmpty) {
      _filteredArticles = [];
      notifyListeners();
      return;
    }

    _isLoading = true;
    notifyListeners();

    try {
      _filteredArticles = await _knowledgeBaseService.searchArticles(query);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Search failed';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadArticle(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _currentArticle = await _knowledgeBaseService.getArticle(id);
      _isLoading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to load article';
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearSearch() {
    _searchQuery = '';
    _filteredArticles = [];
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
