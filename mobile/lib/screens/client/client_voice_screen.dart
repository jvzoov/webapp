// QueuePe Mobile — Client Voice Booking Screen
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class ClientVoiceScreen extends StatefulWidget {
  const ClientVoiceScreen({super.key});
  @override
  State<ClientVoiceScreen> createState() => _ClientVoiceScreenState();
}

class _ClientVoiceScreenState extends State<ClientVoiceScreen> {
  String _lang = 'en-IN';
  String _status = 'Use microphone input if supported; otherwise demo simulation will fill the booking fields.';
  Map<String, String> _parsed = {'Location': '—', 'Service': '—', 'Time': '—', 'Cost': '—'};

  void _simulate() {
    final samples = {'en-IN': 'RTO renewal at 8 am ₹449', 'hi-IN': 'पासपोर्ट सेवा 9 am ₹449', 'kn-IN': 'ಬ್ಯಾಂಕ್ ಟೋಕನ್ 10 am ₹449'};
    setState(() {
      _status = 'Speech API unavailable, demo simulation applied.';
      _parsed = {'Location': 'RTO', 'Service': 'renewal', 'Time': '8:00 am', 'Cost': '₹449'};
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(title: const Text('Voice Booking')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          // Language Tabs + Waveform + Status
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Row(children: ['English|en-IN', 'हिंदी|hi-IN', 'ಕನ್ನಡ|kn-IN'].map((s) {
                final parts = s.split('|'); final active = parts[1] == _lang;
                return Expanded(child: GestureDetector(
                  onTap: () => setState(() => _lang = parts[1]),
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4), padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(color: active ? AppColors.saffronSoft : AppColors.surface, border: Border.all(color: active ? AppColors.saffron : AppColors.border), borderRadius: BorderRadius.circular(10)),
                    child: Center(child: Text(parts[0], style: AppText.mono(11, color: active ? AppColors.saffron : AppColors.ink))),
                  ),
                ));
              }).toList()),
              const SizedBox(height: 12),
              // Waveform bars
              Container(
                height: 72, decoration: BoxDecoration(gradient: const LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [AppColors.bg, AppColors.bg2]), borderRadius: BorderRadius.circular(12)),
                child: Row(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end,
                  children: [18,32,24,46,20,54,26,40,22,50].map((h) => Container(width: 6, height: h * 0.7, margin: const EdgeInsets.symmetric(horizontal: 2.5), decoration: BoxDecoration(color: AppColors.saffron, borderRadius: BorderRadius.circular(999)))).toList()),
              ),
              const SizedBox(height: 12),
              Container(padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.amberSoft, borderRadius: BorderRadius.circular(8)), child: Text(_status, style: AppText.body(13, color: AppColors.ink2))),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: ElevatedButton(onPressed: _simulate, child: Text('START', style: AppText.buttonText.copyWith(fontSize: 14)))),
                const SizedBox(width: 10),
                Expanded(child: OutlinedButton(onPressed: () => setState(() => _parsed = {'Location': '—', 'Service': '—', 'Time': '—', 'Cost': '—'}), child: Text('RETRY', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 14)))),
              ]),
            ]),
          ),
          const SizedBox(height: 12),
          // Parsed Fields
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('PARSED BOOKING FIELDS', style: AppText.sectionLabel),
              const SizedBox(height: 10),
              GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 2.0,
                children: _parsed.entries.map((e) => Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(e.key.toUpperCase(), style: AppText.formLabel), const SizedBox(height: 4), Text(e.value, style: AppText.body(14, weight: FontWeight.w600))]))).toList()),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: ElevatedButton(onPressed: () => context.go('/client/book'), style: ElevatedButton.styleFrom(backgroundColor: AppColors.green), child: Text('CONFIRM', style: AppText.buttonText.copyWith(fontSize: 14)))),
                const SizedBox(width: 10),
                Expanded(child: OutlinedButton(onPressed: _simulate, child: Text('RETRY', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 14)))),
              ]),
            ]),
          ),
        ]),
      ),
    );
  }
}
