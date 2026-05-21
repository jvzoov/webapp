// ============================================================
// QueuePe Mobile — Client History Screen
// Past bookings list with status, rating, and amount
// ============================================================

import 'package:flutter/material.dart';
import '../../core/theme.dart';

class ClientHistoryScreen extends StatelessWidget {
  const ClientHistoryScreen({super.key});

  static const _bookings = [
    {
      'place': 'RTO Office, Koramangala',
      'status': 'ACTIVE',
      'when': 'Today · 2 hrs · Rajan Kumar',
      'amount': '₹449',
      'rating': 0,
    },
    {
      'place': 'Passport Seva Kendra, MG Road',
      'status': 'DONE',
      'when': '3 days ago · 3 hrs · Meena Devi',
      'amount': '₹649',
      'rating': 5,
    },
    {
      'place': 'Govt Hospital OPD, Victoria',
      'status': 'DONE',
      'when': '1 week ago · 4 hrs · Suresh B.',
      'amount': '₹849',
      'rating': 4,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('My Bookings', style: AppText.sectionTitle),
          const SizedBox(height: 14),
          ..._bookings.map((b) => _HistoryCard(
            place: b['place'] as String,
            status: b['status'] as String,
            when: b['when'] as String,
            amount: b['amount'] as String,
            rating: b['rating'] as int,
          )),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final String place, status, when, amount;
  final int rating;

  const _HistoryCard({
    required this.place,
    required this.status,
    required this.when,
    required this.amount,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'ACTIVE';
    final statusBg = isActive ? AppColors.greenSoft : AppColors.bg2;
    final statusFg = isActive ? AppColors.green : AppColors.ink3;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Accent bar
          if (isActive)
            Container(
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.green,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.card)),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: Text(place, style: AppText.cardTitle)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: statusBg,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(status, style: AppText.mono(10, color: statusFg)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(when, style: AppText.body(13, color: AppColors.ink3)),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '$amount paid',
                      style: AppText.display(18, color: isActive ? AppColors.saffron : AppColors.ink2),
                    ),
                    if (rating > 0)
                      Row(
                        children: List.generate(5, (i) => Text(
                          i < rating ? '★' : '☆',
                          style: TextStyle(
                            color: AppColors.saffron,
                            fontSize: 13,
                          ),
                        )),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
