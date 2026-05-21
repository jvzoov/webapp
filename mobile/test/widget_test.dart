// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:queuepe_mobile/main.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: QueuePeApp()));

    // Verify that our role selection screen is shown.
    expect(find.text('Skip The Line.'), findsOneWidget);
    expect(find.text('SKIP QUEUE'), findsOneWidget);
    expect(find.text('EARN MONEY'), findsOneWidget);
  });
}
