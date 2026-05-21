import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class MapScreen extends StatefulWidget {
  final String bookingId;
  const MapScreen({super.key, required this.bookingId});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  Map<String, dynamic>? _lastCheckIn;
  bool _loading = true;
  late RealtimeChannel _channel;
  int _queuePos = 5;

  @override
  void initState() {
    super.initState();
    _loadData();
    _channel = SupabaseService.subscribeToCheckIns(widget.bookingId, (payload) {
      if (mounted) setState(() { _lastCheckIn = payload; if (_queuePos > 1) _queuePos--; });
    });
  }

  Future<void> _loadData() async {
    try {
      final checkIns = await SupabaseService.getCheckIns(widget.bookingId);
      if (checkIns.isNotEmpty) _lastCheckIn = checkIns.first;
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() { _channel.unsubscribe(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('LIVE MAP'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/client/track/${widget.bookingId}')),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.saffron))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(children: [
                GestureDetector(
                  onTap: () async {
                    final lat = _lastCheckIn?['lat'] ?? 28.6139;
                    final lng = _lastCheckIn?['lng'] ?? 77.2090;
                    final url = Uri.parse('https://www.google.com/maps/search/?api=1&query=$lat,$lng');
                    if (await canLaunchUrl(url)) await launchUrl(url);
                  },
                  child: Container(
                    height: 200,
                    decoration: BoxDecoration(color: AppTheme.bg2, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppTheme.border)),
                    child: Center(
                      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Container(padding: const EdgeInsets.all(12), decoration: const BoxDecoration(color: AppTheme.saffron, shape: BoxShape.circle),
                          child: const Icon(Icons.location_on, color: Colors.white, size: 28)),
                        const SizedBox(height: 8),
                        Text('Tap to open Google Maps', style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink2)),
                      ]),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(children: [
                  Expanded(child: _EtaCard(label: 'ETA', value: '${_queuePos * 5} min', icon: Icons.timer_outlined, color: AppTheme.saffron)),
                  const SizedBox(width: 12),
                  Expanded(child: _EtaCard(label: 'Queue Pos.', value: '#$_queuePos', icon: Icons.format_list_numbered, color: AppTheme.blue)),
                ]),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity, padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('LAST UPDATE', style: GoogleFonts.bebasNeue(fontSize: 16, color: AppTheme.ink, letterSpacing: 1.5)),
                    const SizedBox(height: 8),
                    if (_lastCheckIn != null) ...[
                      Text(_lastCheckIn!['note'] ?? 'Check-in logged', style: GoogleFonts.notoSans(color: AppTheme.ink2)),
                      Text('${_lastCheckIn!['lat']}, ${_lastCheckIn!['lng']}', style: GoogleFonts.jetBrainsMono(fontSize: 11, color: AppTheme.ink3)),
                    ] else Text('No location updates yet', style: GoogleFonts.notoSans(color: AppTheme.ink3)),
                  ]),
                ),
              ]),
            ),
    );
  }
}

class _EtaCard extends StatelessWidget {
  final String label; final String value; final IconData icon; final Color color;
  const _EtaCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: color.withOpacity(0.3))),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [Icon(icon, color: color, size: 16), const SizedBox(width: 4), Text(label, style: GoogleFonts.notoSans(fontSize: 11, color: color))]),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.bebasNeue(fontSize: 28, color: color)),
      ]),
    );
  }
}
