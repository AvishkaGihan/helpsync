import '../models/conversation.dart';
import '../models/message.dart';
import 'api_client.dart';
import '../utils/constants.dart';

class ConversationService {
  final ApiClient _apiClient = ApiClient();

  Future<Conversation> createConversation({String? title}) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      AppConstants.conversations,
      {'title': title ?? 'New Conversation'},
    );

    return Conversation.fromJson(response);
  }

  Future<List<Conversation>> getConversations({
    String? status,
    int limit = 20,
    int offset = 0,
  }) async {
    String url = '${AppConstants.conversations}?limit=$limit&offset=$offset';
    if (status != null) {
      url += '&status=$status';
    }

    final response = await _apiClient.get<Map<String, dynamic>>(url);
    final conversations = response['conversations'] as List;

    return conversations.map((c) => Conversation.fromJson(c)).toList();
  }

  Future<Conversation> getConversation(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '${AppConstants.conversations}/$id',
    );

    return Conversation.fromJson(response);
  }

  Future<Conversation> updateConversation(
    String id, {
    String? title,
    String? status,
  }) async {
    final body = <String, dynamic>{};
    if (title != null) body['title'] = title;
    if (status != null) body['status'] = status;

    final response = await _apiClient.patch<Map<String, dynamic>>(
      '${AppConstants.conversations}/$id',
      body,
    );

    return Conversation.fromJson(response);
  }

  Future<List<Message>> getMessages(
    String conversationId, {
    int limit = 50,
  }) async {
    final url =
        '${AppConstants.conversations}/$conversationId/messages?limit=$limit';
    final response = await _apiClient.get<Map<String, dynamic>>(url);

    final messages = response['messages'] as List;
    return messages.map((m) => Message.fromJson(m)).toList();
  }
}
