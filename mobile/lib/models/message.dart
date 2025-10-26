class Message {
  final String id;
  final String conversationId;
  final String senderType;
  final String content;
  final String? sentiment;
  final DateTime createdAt;

  Message({
    required this.id,
    required this.conversationId,
    required this.senderType,
    required this.content,
    this.sentiment,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'],
      conversationId: json['conversationId'],
      senderType: json['senderType'],
      content: json['content'],
      sentiment: json['sentiment'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  bool get isUser => senderType == 'USER';
  bool get isAI => senderType == 'AI';
  bool get isHumanAgent => senderType == 'HUMAN_AGENT';
}
