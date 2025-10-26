class Conversation {
  final String id;
  final String userId;
  final String title;
  final String status;
  final String language;
  final DateTime? escalatedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? messageCount;

  Conversation({
    required this.id,
    required this.userId,
    required this.title,
    required this.status,
    required this.language,
    this.escalatedAt,
    required this.createdAt,
    required this.updatedAt,
    this.messageCount,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'],
      userId: json['userId'],
      title: json['title'],
      status: json['status'],
      language: json['language'],
      escalatedAt: json['escalatedAt'] != null
          ? DateTime.parse(json['escalatedAt'])
          : null,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      messageCount: json['messageCount'],
    );
  }

  bool get isEscalated => status == 'ESCALATED';
  bool get isResolved => status == 'RESOLVED';
  bool get isActive => status == 'ACTIVE';
}
