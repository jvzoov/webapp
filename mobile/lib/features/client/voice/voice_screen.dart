import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:speech_to_text/speech_to_text.dart';
import '../../../core/theme/app_theme.dart';

class VoiceScreen extends StatefulWidget {
  const VoiceScreen({super.key});
  @override
  State<VoiceScreen> createState() => _VoiceScreenState();
}

class _VoiceScreenState extends State<VoiceScreen> with SingleTickerProviderStateMixin {
  final SpeechToText _speech = SpeechToText();
  bool _isListening = false;
  bool _available = false;
  String _transcript = '';
  String _status = 'Tap the mic to start voice booking';
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..repeat(reverse: true);
    _initSpeech();
  }

  Future<void> _initSpeech() async {
    _available = await _speech.initialize();
    if (mounted) setState(() {});
  }

  Future<void> _startListening() async {
    if (!_available) return;
    setState(() { _isListening = true; _status = 'Listening...'; _transcript = ''; });
    await _speech.listen(
      onResult: (r) => setState(() => _transcript = r.recognizedWords),
      listenFor: const Duration(seconds: 30),
    );
  }

  Future<void> _stopListening() async {
    await _speech.stop();
    setState(() { _isListening = false; _status = _transcript.isNotEmpty ? 'Heard your request!' : 'Tap the mic to try again'; });
    if (_transcript.isNotEmpty) {
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) context.go('/client/book?location=${Uri.encodeComponent(_transcript)}');
    }
  }

  @override
  void dispose() { _pulseController.dispose(); _speech.stop(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('VOICE BOOKING'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/client/home')),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            Text('VOICE BOOKING', style: GoogleFonts.bebasNeue(fontSize: 32, color: AppTheme.ink, letterSpacing: 2)),
            const SizedBox(height: 8),
            Text('Say where you need a stander', style: GoogleFonts.notoSans(fontSize: 14, color: AppTheme.ink3), textAlign: TextAlign.center),
            const SizedBox(height: 48),

            // Animated mic button
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                final scale = _isListening ? (1.0 + _pulseController.value * 0.15) : 1.0;
                return Transform.scale(
                  scale: scale,
                  child: GestureDetector(
                    onTap: _isListening ? _stopListening : _startListening,
                    child: Container(
                      width: 120, height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _isListening ? AppTheme.red : AppTheme.saffron,
                        boxShadow: [BoxShadow(color: (_isListening ? AppTheme.red : AppTheme.saffron).withOpacity(0.4), blurRadius: 24, spreadRadius: 4)],
                      ),
                      child: Icon(_isListening ? Icons.stop : Icons.mic, color: Colors.white, size: 48),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 32),

            Text(_status, style: GoogleFonts.notoSans(fontSize: 14, color: AppTheme.ink2, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
            const SizedBox(height: 24),

            if (_transcript.isNotEmpty)
              Container(
                width: double.infinity, padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('YOU SAID:', style: GoogleFonts.notoSans(fontSize: 11, color: AppTheme.ink3, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text('"$_transcript"', style: GoogleFonts.notoSans(fontSize: 16, fontWeight: FontWeight.w600, color: AppTheme.ink)),
                ]),
              ),

            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppTheme.amberSoft, borderRadius: BorderRadius.circular(8)),
              child: Column(children: [
                Text('EXAMPLE PHRASES', style: GoogleFonts.notoSans(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.amber)),
                const SizedBox(height: 6),
                ...['"Aadhaar center"', '"Bank queue"', '"Hospital OPD"'].map((p) =>
                  Text(p, style: GoogleFonts.notoSans(fontSize: 13, color: AppTheme.ink2))),
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}
