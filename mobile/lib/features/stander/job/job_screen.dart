import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class JobScreen extends StatefulWidget {
  final String jobId;
  const JobScreen({super.key, required this.jobId});
  @override
  State<JobScreen> createState() => _JobScreenState();
}

class _JobScreenState extends State<JobScreen> {
  Map<String, dynamic>? _job;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadJob();
  }

  Future<void> _loadJob() async {
    try { _job = await SupabaseService.getBooking(widget.jobId); } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('JOB DETAILS'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/stander/home')),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.saffron))
          : _job == null
              ? Center(child: Text('Job not found', style: GoogleFonts.notoSans(color: AppTheme.ink3)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                      child: Column(children: [
                        _Row('Location', _job!['location_name'] ?? '-'),
                        _Row('Status', _job!['status'] ?? '-'),
                        _Row('Est. Wait', '${_job!['estimated_wait_min'] ?? '--'} min'),
                        _Row('Payout', '₹449'),
                      ]),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(width: double.infinity, child: ElevatedButton(
                      onPressed: () => context.go('/stander/checkin/${widget.jobId}'),
                      child: const Text('START CHECK-IN'),
                    )),
                    const SizedBox(height: 12),
                    SizedBox(width: double.infinity, child: ElevatedButton(
                      onPressed: () => context.go('/stander/geofence/${widget.jobId}'),
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.blue),
                      child: const Text('GEOFENCE MONITOR'),
                    )),
                  ]),
                ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  const _Row(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: GoogleFonts.notoSans(fontSize: 13, color: AppTheme.ink3)),
        Text(value, style: GoogleFonts.notoSans(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.ink)),
      ]),
    );
  }
}
