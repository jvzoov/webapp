import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({super.key});
  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  List<Map<String, dynamic>> _earnings = [];
  bool _loading = true;
  double _total = 0;

  @override
  void initState() {
    super.initState();
    _loadEarnings();
  }

  Future<void> _loadEarnings() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        _earnings = await SupabaseService.getStanderEarnings(user.id);
        _total = _earnings.fold(0, (sum, e) => sum + (e['payout_amount'] as num? ?? 449));
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('MY EARNINGS')),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.saffron))
          : Column(children: [
              // Total banner
              Container(
                width: double.infinity, margin: const EdgeInsets.all(20),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [AppTheme.green, Color(0xFF2ECC71)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('TOTAL EARNINGS', style: GoogleFonts.notoSans(fontSize: 12, color: Colors.white70, letterSpacing: 1)),
                  Text('₹${_total.toStringAsFixed(0)}', style: GoogleFonts.bebasNeue(fontSize: 48, color: Colors.white)),
                  Text('${_earnings.length} completed jobs', style: GoogleFonts.notoSans(fontSize: 13, color: Colors.white70)),
                ]),
              ),
              Expanded(
                child: _earnings.isEmpty
                    ? Center(child: Text('No completed jobs yet', style: GoogleFonts.notoSans(color: AppTheme.ink3)))
                    : ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: _earnings.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, i) {
                          final e = _earnings[i];
                          final date = e['created_at'] != null ? DateFormat('dd MMM yyyy').format(DateTime.parse(e['created_at'])) : '';
                          final amt = e['payout_amount'] ?? 449;
                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                            child: Row(children: [
                              Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppTheme.greenSoft, borderRadius: BorderRadius.circular(8)),
                                child: const Icon(Icons.check_circle_outline, color: AppTheme.green, size: 20)),
                              const SizedBox(width: 12),
                              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text(e['location_name'] ?? 'Job completed', style: GoogleFonts.notoSans(fontWeight: FontWeight.w600, color: AppTheme.ink)),
                                Text(date, style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3)),
                              ])),
                              Text('+₹$amt', style: GoogleFonts.bebasNeue(fontSize: 20, color: AppTheme.green)),
                            ]),
                          );
                        },
                      ),
              ),
            ]),
    );
  }
}
