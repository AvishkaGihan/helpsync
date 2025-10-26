class KnowledgeBaseArticle {
  final String id;
  final String title;
  final String content;
  final String? category;
  final List<String> keywords;
  final DateTime createdAt;
  final DateTime updatedAt;

  KnowledgeBaseArticle({
    required this.id,
    required this.title,
    required this.content,
    this.category,
    required this.keywords,
    required this.createdAt,
    required this.updatedAt,
  });

  factory KnowledgeBaseArticle.fromJson(Map<String, dynamic> json) {
    return KnowledgeBaseArticle(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      category: json['category'],
      keywords: List<String>.from(json['keywords'] ?? []),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
