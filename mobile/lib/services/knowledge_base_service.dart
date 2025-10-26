import '../models/knowledge_base_article.dart';
import 'api_client.dart';
import '../utils/constants.dart';

class KnowledgeBaseService {
  final ApiClient _apiClient = ApiClient();

  Future<List<KnowledgeBaseArticle>> getArticles({
    String? category,
    int limit = 20,
    int offset = 0,
  }) async {
    String url = '${AppConstants.knowledgeBase}?limit=$limit&offset=$offset';
    if (category != null) {
      url += '&category=$category';
    }

    final response = await _apiClient.get<Map<String, dynamic>>(
      url,
      requiresAuth: false,
    );

    final articles = response['articles'] as List;
    return articles.map((a) => KnowledgeBaseArticle.fromJson(a)).toList();
  }

  Future<KnowledgeBaseArticle> getArticle(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '${AppConstants.knowledgeBase}/$id',
      requiresAuth: false,
    );

    return KnowledgeBaseArticle.fromJson(response);
  }

  Future<List<KnowledgeBaseArticle>> searchArticles(String query) async {
    final url = '${AppConstants.knowledgeBaseSearch}?q=$query';
    final response = await _apiClient.get<Map<String, dynamic>>(
      url,
      requiresAuth: false,
    );

    final articles = response['articles'] as List;
    return articles.map((a) => KnowledgeBaseArticle.fromJson(a)).toList();
  }
}
