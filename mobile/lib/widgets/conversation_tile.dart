import 'package:flutter/material.dart';
import '../models/conversation.dart';
import 'package:intl/intl.dart';

class ConversationTile extends StatelessWidget {
  final Conversation conversation;
  final VoidCallback onTap;

  const ConversationTile({
    super.key,
    required this.conversation,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: _getStatusColor(context),
        child: Icon(
          conversation.isEscalated ? Icons.warning : Icons.chat_bubble_outline,
          color: Colors.white,
        ),
      ),
      title: Text(
        conversation.title,
        style: const TextStyle(fontWeight: FontWeight.bold),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      subtitle: Text(
        _getSubtitle(),
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            _formatTimestamp(conversation.updatedAt),
            style: TextStyle(fontSize: 12, color: Colors.grey[600]),
          ),
          if (conversation.isEscalated)
            const Icon(Icons.arrow_upward, size: 16, color: Colors.red),
        ],
      ),
    );
  }

  Color _getStatusColor(BuildContext context) {
    if (conversation.isEscalated) return Colors.red;
    if (conversation.isResolved) return Colors.green;
    return Theme.of(context).colorScheme.primary;
  }

  String _getSubtitle() {
    if (conversation.messageCount != null) {
      return '${conversation.messageCount} messages';
    }
    return conversation.status;
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 7) {
      return DateFormat('MMM d').format(timestamp);
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
