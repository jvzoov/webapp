import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class TrackScreen extends StatefulWidget {
  final String bookingId;
  const TrackScreen({super.key, required this.bookingId});

  @override
  State<TrackScreen> createState() => _TrackScreenState();
}

class _TrackScreenState extends State<TrackScreen> {
  Map<String, dynamic>? _booking;
  List<Map<String, dynamic>> _checkIns = [];
  bool _loading = true;
  late RealtimeChannel _bookingChannel;
  late RealtimeChannel _checkInChannel;

  @override
  void initState() {
    super.initState();
    _loadData();
    _subscribeRealtime();
  }

  Future<void> _loadData() async {
    if (widget.bookingId == 'latest') {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        final bookings = await SupabaseService.getClientBookings(user.id);
        if (bookings.isNotEmpty && mounted) {
          setState(() { _booking = bookings.first; _loading = false; });
          _checkIns = await SupabaseService.getCheckIns(_booking!['id']);
          if (mounted) setState(() {});
        } else if (mounted) setState(() => _loading = false);
      } else { if (mounted) setState(() => _loading = false); }
      return;
    }
    try {
      _booking = await SupabaseService.getBooking(widget.bookingId);
      _checkIns = await SupabaseService.getCheckIns(widget.bookingId);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _subscribeRealtime() {
    final id = widget.bookingId == 'latest' ? 'placeholder' : widget.bookingId;
    _bookingChannel = SupabaseService.subscribeToBooking(id, (payload) {
      if (mounted) setState(() => _booking = {...?_booking, ...payload});
    });
    _checkInChannel = SupabaseService.subscribeToCheckIns(id, (payload) {
      if (mounted) setState(() => _checkIns = [payload, ..._checkIns]);
    });
  }

  @override
  void dispose() {
    _bookingChannel.unsubscribe();
    _checkInChannel.unsubscribe();
    super.dispose();
  }

  Color get _statusColor {
    switch (_booking?['status']) {
      case 'ACTIVE': return AppTheme.green;
      case 'ALERT': return AppTheme.red;
      case 'DONE': return AppTheme.blue;
      default: return AppTheme.amber;
    }
  }

  String get _statusLabel {
    switch (_booking?['status']) {
      case 'ACTIVE': return '🟢 ACTIVE — Stander is in queue';
      case 'ALERT': return '🔴 ALERT — Needs attention';
      case 'DONE': return '✅ DONE — Queue completed';
      default: return '🟡 WAITING — Finding a stander';
    }
  }

  int get _progress {
    switch (_booking?['status']) {
      case 'WAITING': return 20;
      case 'ACTIVE': return 65;
      case 'DONE': return 100;
      default: return 10;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('LIVE TRACKING'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/client/home')),
        actions: [
          if (_booking != null)
            TextButton.icon(
              icon: const Icon(Icons.map_outlined, size: 16),
              label: const Text('MAP'),
              onPressed: () => context.go('/client/map?bookingId=${_booking!['id']}'),
              style: TextButton.styleFrom(foregroundColor: AppTheme.saffron),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.saffron))
          : _booking == null
              ? _NoBooking()
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status banner
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _statusColor.withOpacity(0.4)),
                        ),
                        child: Text(_statusLabel, style: GoogleFonts.notoSans(fontWeight: FontWeight.w600, color: _statusColor)),
                      ),
                      const SizedBox(height: 16),

                      // Progress bar
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text('QUEUE PROGRESS', style: GoogleFonts.bebasNeue(fontSize: 16, letterSpacing: 1.5, color: AppTheme.ink)),
                                Text('$_progress%', style: GoogleFonts.jetBrainsMono(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.saffron)),
                              ],
                            ),
                            const SizedBox(height: 10),
                            ClipRRect(
                              borderRadius: BorderRadius.circular(4),
                              child: LinearProgressIndicator(
                                value: _progress / 100,
                                minHeight: 8,
                                backgroundColor: AppTheme.bg3,
                                valueColor: AlwaysStoppedAnimation(_statusColor),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Booking info grid
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                        child: Column(
                          children: [
                            _InfoRow(label: 'Location', value: _booking!['location_name'] ?? '-'),
                            _InfoRow(label: 'Booking ID', value: (_booking!['id'] as String).substring(0, 8).toUpperCase()),
                            _InfoRow(label: 'Est. Wait', value: '${_booking!['estimated_wait_min'] ?? '--'} min'),
                            if (_booking!['standers'] != null) ...[
                              const Divider(),
                              _InfoRow(label: 'Stander', value: _booking!['standers']['name'] ?? 'Assigned'),
                              _InfoRow(label: 'Phone', value: _booking!['standers']['phone'] ?? '-'),
                              _InfoRow(label: 'Rating', value: '⭐ ${_booking!['standers']['rating'] ?? '4.8'}'),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Check-in log
                      Text('LIVE CHECK-IN LOG', style: GoogleFonts.bebasNeue(fontSize: 18, color: AppTheme.ink, letterSpacing: 1.5)),
                      const SizedBox(height: 8),
                      if (_checkIns.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                          child: Text('Waiting for first check-in...', style: GoogleFonts.notoSans(color: AppTheme.ink3)),
                        )
                      else
                        ..._checkIns.map((ci) => _CheckInTile(checkIn: ci)),

                      const SizedBox(height: 100),
                    ],
                  ),
                ),
    );
  }
}

class _NoBooking extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 60, color: AppTheme.ink3),
            const SizedBox(height: 16),
            Text('No active booking', style: GoogleFonts.bebasNeue(fontSize: 24, color: AppTheme.ink)),
            const SizedBox(height: 8),
            Text('Book a stander first to see live tracking here.',
                style: GoogleFonts.notoSans(color: AppTheme.ink3), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: () => context.go('/client/book'), child: const Text('BOOK NOW')),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;
  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.notoSans(fontSize: 13, color: AppTheme.ink3)),
          Flexible(child: Text(value, style: GoogleFonts.notoSans(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.ink), textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

class _CheckInTile extends StatelessWidget {
  final Map<String, dynamic> checkIn;
  const _CheckInTile({required this.checkIn});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Container(
            width: 8, height: 8,
            decoration: const BoxDecoration(color: AppTheme.green, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(checkIn['note'] ?? 'Check-in logged', style: GoogleFonts.notoSans(fontSize: 13, fontWeight: FontWeight.w500, color: AppTheme.ink)),
                Text(checkIn['created_at']?.toString().substring(11, 19) ?? '', style: GoogleFonts.jetBrainsMono(fontSize: 11, color: AppTheme.ink3)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
