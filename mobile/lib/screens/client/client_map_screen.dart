// QueuePe Mobile — Client Map Screen
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class ClientMapScreen extends StatefulWidget {
  const ClientMapScreen({super.key});
  @override
  State<ClientMapScreen> createState() => _ClientMapScreenState();
}

class _ClientMapScreenState extends State<ClientMapScreen> {
  String _mode = 'street';
  String _coords = '12.9352, 77.6245';
  String _dist = '2.4 km';
  String _pos = '#03';
  String _eta = '11 min';

  void _refreshGPS() {
    final pts = [
      ['12.9352, 77.6245', '2.4 km', '#03', '11 min'],
      ['12.9361, 77.6277', '1.9 km', '#02', '8 min'],
      ['12.9340, 77.6210', '3.2 km', '#04', '14 min']
    ];
    final p = pts[Random().nextInt(pts.length)];
    setState(() {
      _coords = p[0];
      _dist = p[1];
      _pos = p[2];
      _eta = p[3];
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('GPS refreshed')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(title: const Text('Map & ETA')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          // Map Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Row(children: ['Street|street', 'Satellite|satellite', 'Nearby|nearby'].map((s) {
                final parts = s.split('|'); final active = parts[1] == _mode;
                return Expanded(child: GestureDetector(
                  onTap: () => setState(() => _mode = parts[1]),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4), padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(color: active ? AppColors.saffronSoft : AppColors.surface, border: Border.all(color: active ? AppColors.saffron : AppColors.border), borderRadius: BorderRadius.circular(10)),
                    child: Center(child: Text(parts[0], style: AppText.mono(11, color: active ? AppColors.saffron : AppColors.ink))),
                  ),
                ));
              }).toList()),
              const SizedBox(height: 12),
              // Map placeholder (grey box with grid)
              Container(
                height: 220, decoration: BoxDecoration(color: AppColors.bg2, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                child: Center(child: Text('Map View: $_mode\nCenter: $_coords', textAlign: TextAlign.center, style: AppText.mono(12, color: AppColors.ink3))),
              ),
              const SizedBox(height: 12),
              // Live bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12), decoration: BoxDecoration(color: AppColors.ink, borderRadius: BorderRadius.circular(12)),
                child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('GPS locked near queue', style: AppText.body(13, color: Colors.white, weight: FontWeight.w600)),
                    const SizedBox(height: 2), Text(_coords, style: AppText.mono(10, color: Colors.white54)),
                  ]),
                  ElevatedButton(onPressed: _refreshGPS, style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8)), child: Text('Refresh', style: AppText.buttonText.copyWith(fontSize: 12))),
                ]),
              ),
              const SizedBox(height: 12),
              // ETA Grid
              GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 2.0,
                children: [
                  _EtaBox('Distance', _dist), _EtaBox('Queue pos', _pos), _EtaBox('ETA', _eta), _EtaBox('Sync', 'Realtime ready'),
                ]),
            ]),
          ),
          const SizedBox(height: 12),
          // Integration Guide
          Container(
            padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('INTEGRATION GUIDE', style: AppText.sectionLabel),
              const SizedBox(height: 10),
              _GuideItem('Enable Maps JavaScript API, Places API, Directions API and Maps Embed API.'),
              _GuideItem('Wire Supabase realtime stander position updates to route and ETA cards.'),
              _GuideItem('Move sensitive key-based operations to your backend or edge functions.'),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _EtaBox extends StatelessWidget {
  final String label, value;
  const _EtaBox(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(label.toUpperCase(), style: AppText.formLabel), const SizedBox(height: 4), Text(value, style: AppText.body(14, weight: FontWeight.w600))]),
    );
  }
}

class _GuideItem extends StatelessWidget {
  final String text;
  const _GuideItem(this.text);
  @override
  Widget build(BuildContext context) {
    return Padding(padding: const EdgeInsets.only(bottom: 6), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Container(width: 6, height: 6, margin: const EdgeInsets.only(top: 4), decoration: const BoxDecoration(color: AppColors.green, shape: BoxShape.circle)), const SizedBox(width: 8), Expanded(child: Text(text, style: AppText.body(13, color: AppColors.ink2)))]));
  }
}
