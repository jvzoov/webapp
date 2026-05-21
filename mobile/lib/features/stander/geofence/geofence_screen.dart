import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class GeofenceScreen extends StatefulWidget {
  final String bookingId;
  const GeofenceScreen({super.key, required this.bookingId});
  @override
  State<GeofenceScreen> createState() => _GeofenceScreenState();
}

class _GeofenceScreenState extends State<GeofenceScreen> {
  Position? _anchorPos;
  Position? _currentPos;
  bool _isBreach = false;
  bool _watching = false;
  StreamSubscription<Position>? _posStream;
  static const double _radiusMeters = 50;

  Future<void> _startWatching() async {
    LocationPermission perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
    if (perm == LocationPermission.denied) return;

    _anchorPos = await Geolocator.getCurrentPosition();
    setState(() => _watching = true);

    _posStream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 5),
    ).listen((pos) {
      final dist = Geolocator.distanceBetween(
        _anchorPos!.latitude, _anchorPos!.longitude,
        pos.latitude, pos.longitude,
      );
      setState(() { _currentPos = pos; _isBreach = dist > _radiusMeters; });
      if (_isBreach) _handleBreach(dist);
    });
  }

  Future<void> _handleBreach(double dist) async {
    final user = Supabase.instance.client.auth.currentUser;
    await SupabaseService.sendNotification(
      userId: user?.id ?? 'demo',
      title: '⚠️ Geofence Breach',
      body: 'Stander moved ${dist.toStringAsFixed(0)}m away from the queue location!',
      type: 'alert',
    );
  }

  void _stopWatching() { _posStream?.cancel(); setState(() { _watching = false; _isBreach = false; _anchorPos = null; }); }

  @override
  void dispose() { _posStream?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('GEOFENCE MONITOR'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/stander/home')),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Status
          AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            width: double.infinity, padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: !_watching ? AppTheme.bg2 : (_isBreach ? AppTheme.redSoft : AppTheme.greenSoft),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: !_watching ? AppTheme.border : (_isBreach ? AppTheme.red : AppTheme.green).withOpacity(0.4)),
            ),
            child: Row(children: [
              Icon(!_watching ? Icons.location_off_outlined : (_isBreach ? Icons.warning_amber_rounded : Icons.shield_outlined),
                  color: !_watching ? AppTheme.ink3 : (_isBreach ? AppTheme.red : AppTheme.green), size: 24),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(
                  !_watching ? 'GEOFENCE INACTIVE' : (_isBreach ? 'BREACH DETECTED!' : 'WITHIN SAFE ZONE'),
                  style: GoogleFonts.bebasNeue(fontSize: 16, letterSpacing: 1, color: !_watching ? AppTheme.ink3 : (_isBreach ? AppTheme.red : AppTheme.green)),
                ),
                Text(
                  !_watching ? 'Tap START to enable geo-tracking' : (_isBreach ? 'You moved out of the ${_radiusMeters.toInt()}m zone!' : 'Stay within ${_radiusMeters.toInt()}m of the location'),
                  style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3),
                ),
              ])),
            ]),
          ),
          const SizedBox(height: 20),

          // Visual zone diagram
          Center(
            child: Stack(alignment: Alignment.center, children: [
              Container(
                width: 180, height: 180,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (_isBreach ? AppTheme.red : AppTheme.green).withOpacity(0.08),
                  border: Border.all(color: (_isBreach ? AppTheme.red : AppTheme.green).withOpacity(0.3), width: 2),
                ),
              ),
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: (_isBreach ? AppTheme.red : AppTheme.green).withOpacity(0.15),
                ),
              ),
              Icon(Icons.location_on, color: _isBreach ? AppTheme.red : AppTheme.saffron, size: 36),
              if (_watching)
                Positioned(
                  right: 30, bottom: 30,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: _isBreach ? AppTheme.red : AppTheme.green, shape: BoxShape.circle),
                    child: const Icon(Icons.person, color: Colors.white, size: 16),
                  ),
                ),
            ]),
          ),
          const SizedBox(height: 20),

          if (_currentPos != null) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
              child: Column(children: [
                _InfoRow('Current GPS', '${_currentPos!.latitude.toStringAsFixed(4)}, ${_currentPos!.longitude.toStringAsFixed(4)}'),
                _InfoRow('Anchor GPS', '${_anchorPos!.latitude.toStringAsFixed(4)}, ${_anchorPos!.longitude.toStringAsFixed(4)}'),
                _InfoRow('Distance', '${Geolocator.distanceBetween(_anchorPos!.latitude, _anchorPos!.longitude, _currentPos!.latitude, _currentPos!.longitude).toStringAsFixed(0)}m'),
                _InfoRow('Safe Zone', '${_radiusMeters.toInt()}m radius'),
              ]),
            ),
            const SizedBox(height: 16),
          ],

          SizedBox(
            width: double.infinity,
            child: _watching
                ? OutlinedButton(onPressed: _stopWatching, child: const Text('STOP GEOFENCE'))
                : ElevatedButton.icon(
                    onPressed: _startWatching,
                    icon: const Icon(Icons.my_location),
                    label: const Text('START GEOFENCE MONITOR'),
                  ),
          ),
        ]),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  const _InfoRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3)),
        Text(value, style: GoogleFonts.jetBrainsMono(fontSize: 12, color: AppTheme.ink2)),
      ]),
    );
  }
}
