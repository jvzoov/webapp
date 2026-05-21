import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class StanderHomeScreen extends StatefulWidget {
  const StanderHomeScreen({super.key});
  @override
  State<StanderHomeScreen> createState() => _StanderHomeScreenState();
}

class _StanderHomeScreenState extends State<StanderHomeScreen> {
  List<Map<String, dynamic>> _jobs = [];
  bool _loading = true;
  int _streak = 3;
  double _todayEarnings = 0;
  late RealtimeChannel _channel;

  @override
  void initState() {
    super.initState();
    _loadJobs();
    _channel = SupabaseService.subscribeToAvailableJobs((_) => _loadJobs());
  }

  Future<void> _loadJobs() async {
    try {
      _jobs = await SupabaseService.getAvailableJobs();
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _acceptJob(String bookingId) async {
    final user = Supabase.instance.client.auth.currentUser;
    final standerId = user?.id ?? 'demo-stander';
    try {
      await SupabaseService.acceptJob(bookingId, standerId);
      setState(() { _todayEarnings += 449; });
      if (mounted) context.go('/stander/checkin/$bookingId');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  void dispose() { _channel.unsubscribe(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: CustomScrollView(slivers: [
        SliverAppBar(
          floating: true, backgroundColor: AppTheme.surface, elevation: 0,
          titleSpacing: 20,
          title: Row(children: [
            Text('QUEUE', style: GoogleFonts.bebasNeue(fontSize: 22, color: AppTheme.saffron, letterSpacing: 2)),
            Text('PE', style: GoogleFonts.bebasNeue(fontSize: 22, color: AppTheme.ink, letterSpacing: 2)),
          ]),
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.greenSoft, borderRadius: BorderRadius.circular(20)),
              child: Text('STANDER', style: GoogleFonts.notoSans(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.green)),
            ),
          ],
          bottom: PreferredSize(preferredSize: const Size.fromHeight(1), child: Container(height: 1, color: AppTheme.border)),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Stats row
              Row(children: [
                Expanded(child: _StatCard(label: 'TODAY\'S EARNINGS', value: '₹${_todayEarnings.toStringAsFixed(0)}', color: AppTheme.green, icon: Icons.account_balance_wallet_outlined)),
                const SizedBox(width: 12),
                Expanded(child: _StatCard(label: 'STREAK', value: '🔥 $_streak days', color: AppTheme.amber, icon: Icons.local_fire_department_outlined)),
              ]),
              const SizedBox(height: 20),
              Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                Text('AVAILABLE JOBS', style: GoogleFonts.bebasNeue(fontSize: 20, color: AppTheme.ink, letterSpacing: 1.5)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: AppTheme.greenSoft, borderRadius: BorderRadius.circular(20)),
                  child: Text('${_jobs.length} nearby', style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.green, fontWeight: FontWeight.w600)),
                ),
              ]),
              const SizedBox(height: 12),
            ]),
          ),
        ),
        _loading
            ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator(color: AppTheme.saffron)))
            : _jobs.isEmpty
                ? SliverFillRemaining(
                    child: Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      const Icon(Icons.search, size: 60, color: AppTheme.ink3),
                      const SizedBox(height: 12),
                      Text('No jobs available right now', style: GoogleFonts.notoSans(color: AppTheme.ink3)),
                      const SizedBox(height: 8),
                      Text('Pull to refresh', style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3)),
                    ])),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) {
                        final job = _jobs[i];
                        return _JobCard(job: job, onAccept: () => _acceptJob(job['id']));
                      },
                      childCount: _jobs.length,
                    ),
                  ),
        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ]),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value; final Color color; final IconData icon;
  const _StatCard({required this.label, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Icon(icon, color: color, size: 16), const SizedBox(width: 4), Text(label, style: GoogleFonts.notoSans(fontSize: 9, color: color, letterSpacing: 0.5))]),
        const SizedBox(height: 6),
        Text(value, style: GoogleFonts.bebasNeue(fontSize: 22, color: color)),
      ]),
    );
  }
}

class _JobCard extends StatelessWidget {
  final Map<String, dynamic> job;
  final VoidCallback onAccept;
  const _JobCard({required this.job, required this.onAccept});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppTheme.saffronSoft, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.location_on_outlined, color: AppTheme.saffron, size: 20)),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(job['location_name'] ?? 'Location', style: GoogleFonts.notoSans(fontWeight: FontWeight.w600, color: AppTheme.ink)),
            Text('Est. ${job['estimated_wait_min'] ?? '--'} min wait', style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3)),
          ])),
          Text('₹449', style: GoogleFonts.bebasNeue(fontSize: 22, color: AppTheme.saffron)),
        ]),
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, child: ElevatedButton(onPressed: onAccept, child: const Text('ACCEPT JOB'))),
      ]),
    );
  }
}
