import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';
import 'package:intl/intl.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  List<Map<String, dynamic>> _bookings = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        _bookings = await SupabaseService.getClientBookings(user.id);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'ACTIVE': return AppTheme.green;
      case 'DONE': return AppTheme.blue;
      case 'ALERT': return AppTheme.red;
      default: return AppTheme.amber;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('BOOKING HISTORY')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.saffron))
          : _bookings.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.receipt_long_outlined, size: 60, color: AppTheme.ink3),
                      const SizedBox(height: 16),
                      Text('No bookings yet', style: GoogleFonts.bebasNeue(fontSize: 24, color: AppTheme.ink)),
                      const SizedBox(height: 8),
                      Text('Your booking history will appear here', style: GoogleFonts.notoSans(color: AppTheme.ink3)),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(20),
                  itemCount: _bookings.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final b = _bookings[i];
                    final status = b['status'] as String? ?? 'WAITING';
                    final date = b['created_at'] != null
                        ? DateFormat('dd MMM, hh:mm a').format(DateTime.parse(b['created_at']))
                        : '';
                    return GestureDetector(
                      onTap: () => context.go('/client/track/${b['id']}'),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppTheme.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: _statusColor(status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(Icons.receipt_outlined, color: _statusColor(status), size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(b['location_name'] ?? 'Custom Location',
                                      style: GoogleFonts.notoSans(fontWeight: FontWeight.w600, color: AppTheme.ink)),
                                  Text(date, style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3)),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _statusColor(status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(status, style: GoogleFonts.notoSans(fontSize: 11, fontWeight: FontWeight.w600, color: _statusColor(status))),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
