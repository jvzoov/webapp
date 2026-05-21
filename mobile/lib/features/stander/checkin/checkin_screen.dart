import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class CheckinScreen extends StatefulWidget {
  final String bookingId;
  const CheckinScreen({super.key, required this.bookingId});
  @override
  State<CheckinScreen> createState() => _CheckinScreenState();
}

class _CheckinScreenState extends State<CheckinScreen> {
  bool _isCheckedIn = false;
  bool _loading = false;
  Position? _position;
  final List<Map<String, dynamic>> _log = [];
  final _noteCtrl = TextEditingController();

  Future<void> _getLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }
    _position = await Geolocator.getCurrentPosition();
    if (mounted) setState(() {});
  }

  Future<void> _checkIn() async {
    setState(() => _loading = true);
    await _getLocation();
    try {
      final user = Supabase.instance.client.auth.currentUser;
      await SupabaseService.logCheckIn(
        bookingId: widget.bookingId,
        standerId: user?.id ?? 'demo',
        lat: _position?.latitude ?? 0,
        lng: _position?.longitude ?? 0,
        note: _noteCtrl.text.trim().isNotEmpty ? _noteCtrl.text.trim() : 'Check-in logged',
      );
      final entry = {
        'note': _noteCtrl.text.trim().isNotEmpty ? _noteCtrl.text.trim() : 'Check-in logged',
        'time': TimeOfDay.now().format(context),
        'lat': _position?.latitude ?? 0,
        'lng': _position?.longitude ?? 0,
      };
      setState(() { _log.insert(0, entry); _isCheckedIn = true; _loading = false; _noteCtrl.clear(); });
      await SupabaseService.updateBookingStatus(widget.bookingId, 'ACTIVE');
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() { _noteCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('CHECK-IN'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/stander/home')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Status card
          Container(
            width: double.infinity, padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _isCheckedIn ? AppTheme.greenSoft : AppTheme.saffronSoft,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _isCheckedIn ? AppTheme.green.withOpacity(0.4) : AppTheme.saffron.withOpacity(0.4)),
            ),
            child: Row(children: [
              Icon(_isCheckedIn ? Icons.check_circle : Icons.location_searching, color: _isCheckedIn ? AppTheme.green : AppTheme.saffron),
              const SizedBox(width: 10),
              Expanded(child: Text(
                _isCheckedIn ? '✅ Checked in successfully! Client has been notified.' : 'Tap CHECK IN to log your location and notify the client.',
                style: GoogleFonts.notoSans(color: _isCheckedIn ? AppTheme.green : AppTheme.saffron, fontWeight: FontWeight.w500),
              )),
            ]),
          ),
          const SizedBox(height: 20),

          if (_position != null)
            Container(
              padding: const EdgeInsets.all(12), margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
              child: Row(children: [
                const Icon(Icons.gps_fixed, color: AppTheme.green, size: 18),
                const SizedBox(width: 8),
                Text('${_position!.latitude.toStringAsFixed(4)}, ${_position!.longitude.toStringAsFixed(4)}',
                    style: GoogleFonts.jetBrainsMono(fontSize: 13, color: AppTheme.ink2)),
              ]),
            ),

          TextField(
            controller: _noteCtrl,
            decoration: const InputDecoration(labelText: 'Note (e.g., "At token counter #5")', prefixIcon: Icon(Icons.edit_note)),
          ),
          const SizedBox(height: 16),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _loading ? null : _checkIn,
              icon: _loading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.location_on),
              label: Text(_isCheckedIn ? 'LOG ANOTHER CHECK-IN' : 'CHECK IN NOW'),
            ),
          ),
          const SizedBox(height: 24),

          if (_isCheckedIn) ...[
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text('CHECK-IN LOG', style: GoogleFonts.bebasNeue(fontSize: 18, color: AppTheme.ink, letterSpacing: 1.5)),
              TextButton(
                onPressed: () async {
                  await SupabaseService.updateBookingStatus(widget.bookingId, 'DONE');
                  if (mounted) context.go('/stander/home');
                },
                child: const Text('MARK DONE', style: TextStyle(color: AppTheme.green)),
              ),
            ]),
            ..._log.map((l) => Container(
              margin: const EdgeInsets.only(bottom: 8), padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppTheme.border)),
              child: Row(children: [
                const Icon(Icons.radio_button_checked, color: AppTheme.green, size: 14),
                const SizedBox(width: 10),
                Expanded(child: Text(l['note']!, style: GoogleFonts.notoSans(fontSize: 13, color: AppTheme.ink))),
                Text(l['time']!, style: GoogleFonts.jetBrainsMono(fontSize: 11, color: AppTheme.ink3)),
              ]),
            )),
          ],
          const SizedBox(height: 100),
        ]),
      ),
    );
  }
}
