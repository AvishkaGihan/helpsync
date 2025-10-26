import 'package:flutter/material.dart';
import '../models/message.dart';
import 'package:intl/intl.dart';

class ChatBubble extends StatelessWidget {
  final Message message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
        padding: const EdgeInsets.all(12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isUser
              ? Theme.of(context).colorScheme.primary
              : Colors.grey[200],
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser && message.isHumanAgent)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  'Human Agent',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isUser ? Colors.white70 : Colors.grey[600],
                  ),
                ),
              ),
            Text(
              message.content,
              style: TextStyle(
                color: isUser ? Colors.white : Colors.black87,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat('HH:mm').format(message.createdAt),
                  style: TextStyle(
                    fontSize: 12,
                    color: isUser ? Colors.white70 : Colors.grey[600],
                  ),
                ),
                if (message.sentiment != null) ...[
                  const SizedBox(width: 8),
                  _buildSentimentIndicator(message.sentiment!),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSentimentIndicator(String sentiment) {
    IconData icon;
    Color color;

    switch (sentiment.toLowerCase()) {
      case 'positive':
        icon = Icons.sentiment_satisfied;
        color = Colors.green;
        break;
      case 'negative':
        icon = Icons.sentiment_dissatisfied;
        color = Colors.red;
        break;
      default:
        icon = Icons.sentiment_neutral;
        color = Colors.orange;
    }

    return Icon(icon, size: 14, color: color);
  }
}
