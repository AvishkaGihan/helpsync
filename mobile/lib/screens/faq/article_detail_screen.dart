import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/knowledge_base_article.dart';
import '../../providers/conversation_provider.dart';
import '../chat/conversation_screen.dart';

class ArticleDetailScreen extends StatelessWidget {
  final KnowledgeBaseArticle article;

  const ArticleDetailScreen({super.key, required this.article});

  Future<void> _startChatWithContext(BuildContext context) async {
    final conversationProvider = context.read<ConversationProvider>();
    final conversation = await conversationProvider.createConversation(
      title: 'Help with: ${article.title}',
    );

    if (!context.mounted) return;

    if (conversation != null) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ConversationScreen(conversation: conversation),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Article')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              article.title,
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            if (article.category != null)
              Chip(
                label: Text(article.category!),
                backgroundColor: Theme.of(
                  context,
                ).colorScheme.primary.withValues(alpha: 0.1),
              ),
            const SizedBox(height: 24),
            Text(article.content, style: Theme.of(context).textTheme.bodyLarge),
            const SizedBox(height: 32),
            const Divider(),
            const SizedBox(height: 16),
            Text(
              'Still need help?',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text('Chat with our AI assistant for personalized support.'),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _startChatWithContext(context),
                icon: const Icon(Icons.chat),
                label: const Text('Start Chat'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
