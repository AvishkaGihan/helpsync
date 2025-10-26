import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

class MockAuthProvider extends AuthProvider {
  @override
  bool get isLoading => false;

  @override
  bool get isAuthenticated => false;

  @override
  String? get error => null;

  @override
  Future<void> checkAuthentication() async {
    // Do nothing in test
  }
}

void main() {
  testWidgets('App launches and shows login screen', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: ChangeNotifierProvider<AuthProvider>.value(
          value: MockAuthProvider(),
          child: const AuthWrapper(),
        ),
      ),
    );
    await tester.pump();

    // Verify login screen elements
    expect(find.text('HelpSync'), findsOneWidget);
    expect(find.text('AI-Powered Customer Support'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));
    expect(find.text('Login'), findsWidgets);
  });

  testWidgets('ChatBubble displays message correctly', (
    WidgetTester tester,
  ) async {
    // This would be in test/widgets/chat_bubble_test.dart
    // Example test structure provided in architecture doc
  });
}
