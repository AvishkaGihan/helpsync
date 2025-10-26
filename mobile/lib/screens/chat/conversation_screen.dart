import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/conversation.dart';
import '../../providers/message_provider.dart';
import '../../widgets/chat_bubble.dart';
import '../../widgets/message_input.dart';
import '../../widgets/typing_indicator.dart';

class ConversationScreen extends StatefulWidget {
  final Conversation conversation;

  const ConversationScreen({super.key, required this.conversation});

  @override
  State<ConversationScreen> createState() => _ConversationScreenState();
}

class _ConversationScreenState extends State<ConversationScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _showEscalationBanner = false;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    final messageProvider = context.read<MessageProvider>();

    // Connect socket
    await messageProvider.connectSocket();

    // Load messages
    await messageProvider.loadMessages(widget.conversation.id);

    // Join conversation room
    messageProvider.joinConversation(widget.conversation.id);

    // Listen for escalations
    messageProvider.escalationStream.listen((data) {
      if (data['conversationId'] == widget.conversation.id) {
        setState(() {
          _showEscalationBanner = true;
        });
        _showEscalationDialog();
      }
    });

    // Scroll to bottom
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _showEscalationDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.orange),
            SizedBox(width: 8),
            Text('Conversation Escalated'),
          ],
        ),
        content: const Text(
          'Your conversation has been escalated to a human support agent. '
          'We\'ll respond shortly.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.conversation.title),
            if (_showEscalationBanner || widget.conversation.isEscalated)
              const Text(
                '🔴 Escalated',
                style: TextStyle(fontSize: 12, color: Colors.red),
              ),
          ],
        ),
      ),
      body: Column(
        children: [
          if (_showEscalationBanner || widget.conversation.isEscalated)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(8),
              color: Colors.orange[100],
              child: const Text(
                'A support agent will assist you soon',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.orange),
              ),
            ),
          Expanded(
            child: Consumer<MessageProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading && provider.messages.isEmpty) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (provider.error != null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 16),
                        Text(provider.error!),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            provider.loadMessages(widget.conversation.id);
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }

                // Auto-scroll when new message arrives
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  _scrollToBottom();
                });

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  itemCount:
                      provider.messages.length + (provider.isTyping ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == provider.messages.length) {
                      return const TypingIndicator();
                    }
                    return ChatBubble(message: provider.messages[index]);
                  },
                );
              },
            ),
          ),
          Consumer<MessageProvider>(
            builder: (context, provider, _) {
              return MessageInput(
                onSend: (content) {
                  provider.sendMessage(widget.conversation.id, content);
                },
                onTyping: () {
                  provider.sendTyping(widget.conversation.id);
                },
                isEnabled: provider.isConnected,
              );
            },
          ),
        ],
      ),
    );
  }
}
