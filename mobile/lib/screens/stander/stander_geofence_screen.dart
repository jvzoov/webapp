// QueuePe Mobile — Stander Geofence Screen
import 'package:flutter/material.dart';
import '../../core/theme.dart';

class StanderGeofenceScreen extends StatefulWidget {
  const StanderGeofenceScreen({super.key});
  @override
  State<StanderGeofenceScreen> createState() => _StanderGeofenceScreenState();
}

class _StanderGeofenceScreenState extends State<StanderGeofenceScreen> with SingleTickerProviderStateMixin {
  bool _breach = false;
  final List<Map<String, String>> _log = [
    {'time': 'LIVE', 'msg': 'Boundary monitoring active. No breach events yet.'}
  ];
  late AnimationController _animCtrl;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() { _animCtrl.dispose(); super.dispose(); }

  void _simBreach() {
    setState(() {
      _breach = true;
      _animCtrl.duration = const Duration(milliseconds: 800);
      _animCtrl.repeat(reverse: true);
      _log.insert(0, {'time': _t(), 'msg': 'Boundary breach detected; client alerted, booking paused.'});
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Geofence breach simulated')));
  }

  void _reset() {
    setState(() {
      _breach = false;
      _animCtrl.duration = const Duration(seconds: 2);
      _animCtrl.repeat();
      _log.insert(0, {'time': _t(), 'msg': 'Boundary restored to safe state.'});
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Safe zone restored')));
  }

  String _t() { final n = TimeOfDay.now(); return '${n.hour.toString().padLeft(2, '0')}:${n.minute.toString().padLeft(2, '0')}'; }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text('Stander Geo-fencing', style: AppText.sectionLabel),
        const SizedBox(height: 4), Text('Safe boundary monitoring', style: AppText.sectionTitle),
        const SizedBox(height: 14),
        // Radar
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(children: [
            Container(
              height: 180, alignment: Alignment.center,
              child: AnimatedBuilder(
                animation: _animCtrl,
                builder: (context, child) {
                  return Container(
                    width: 170, height: 170,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _breach ? AppColors.redSoft : AppColors.greenSoft,
                      border: Border.all(color: _breach ? AppColors.red.withOpacity(0.5) : AppColors.green.withOpacity(0.35), width: 2),
                      boxShadow: [BoxShadow(color: (_breach ? AppColors.red : AppColors.green).withOpacity((1 - _animCtrl.value) * 0.3), spreadRadius: _animCtrl.value * 22)],
                    ),
                    child: Stack(alignment: Alignment.center, children: [
                      Container(width: 104, height: 104, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: (_breach ? AppColors.red : AppColors.green).withOpacity(0.45), width: 2, style: BorderStyle.none))),
                      Container(width: 18, height: 18, decoration: const BoxDecoration(color: AppColors.green, shape: BoxShape.circle)),
                      AnimatedPositioned(
                        duration: const Duration(milliseconds: 900), curve: Curves.easeInOut,
                        top: _breach ? 15 : 65, left: _breach ? 130 : 100,
                        child: Container(width: 14, height: 14, decoration: BoxDecoration(color: _breach ? AppColors.red : AppColors.saffron, shape: BoxShape.circle)),
                      ),
                    ]),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('ALLOWED RADIUS', style: AppText.formLabel), const SizedBox(height: 4), Text('50m', style: AppText.body(14, weight: FontWeight.w600))]))),
              const SizedBox(width: 10),
              Expanded(child: Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('CURRENT STATE', style: AppText.formLabel), const SizedBox(height: 4), Text(_breach ? 'BREACH' : 'SAFE', style: AppText.body(14, weight: FontWeight.w600, color: _breach ? AppColors.red : AppColors.green))]))),
            ]),
          ]),
        ),
        const SizedBox(height: 12),
        // Actions
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(children: [
            GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 2.0, children: [
              _ActionBox('Client alert', 'Instant push'), _ActionBox('Audit log', 'Every breach'), _ActionBox('Pause booking', 'Auto hold'), _ActionBox('Backup', 'Alternate stander'),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: ElevatedButton(onPressed: _simBreach, style: ElevatedButton.styleFrom(backgroundColor: AppColors.red), child: Text('BREACH', style: AppText.buttonText.copyWith(fontSize: 14)))),
              const SizedBox(width: 10),
              Expanded(child: OutlinedButton(onPressed: _reset, child: Text('RESET', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 14)))),
            ]),
          ]),
        ),
        const SizedBox(height: 12),
        // Log
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('AUDIT LOG', style: AppText.sectionLabel), const SizedBox(height: 6),
            Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(8)), child: Column(children: _log.map((l) => Padding(padding: const EdgeInsets.only(bottom: 6), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Container(width: 6, height: 6, margin: const EdgeInsets.only(top: 4), decoration: const BoxDecoration(color: AppColors.green, shape: BoxShape.circle)), const SizedBox(width: 8), Text(l['time']!, style: AppText.mono(12)), const SizedBox(width: 8), Expanded(child: Text(l['msg']!, style: AppText.body(12, color: AppColors.ink2)))]))).toList())),
          ]),
        ),
      ]),
    );
  }
}

class _ActionBox extends StatelessWidget {
  final String label, value;
  const _ActionBox(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(label, style: AppText.body(13, weight: FontWeight.w600)), const SizedBox(height: 2), Text(value, style: AppText.mono(10, color: AppColors.ink3))]));
  }
}
