import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';

class WhatsAppScreen extends StatefulWidget {
  const WhatsAppScreen({super.key});
  @override
  State<WhatsAppScreen> createState() => _WhatsAppScreenState();
}

class _WhatsAppScreenState extends State<WhatsAppScreen> {
  final _phoneCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  bool _otpSent = false;
  bool _loading = false;
  bool _verified = false;
  final List<Map<String, String>> _messages = [
    {'who': 'agent', 'text': 'Hi! Welcome to QueuePe 🎉\nWe can verify your account using WhatsApp OTP.'},
  ];

  void _addMessage(String text, String who) => setState(() => _messages.add({'who': who, 'text': text}));

  Future<void> _sendOtp() async {
    if (_phoneCtrl.text.length < 10) return;
    setState(() { _loading = true; });
    await Future.delayed(const Duration(seconds: 1));
    _addMessage('Send OTP to ${_phoneCtrl.text}', 'me');
    await Future.delayed(const Duration(milliseconds: 600));
    _addMessage('✅ OTP sent to +91 ${_phoneCtrl.text}\nPlease enter the 6-digit code below.', 'agent');
    setState(() { _loading = false; _otpSent = true; });
  }

  Future<void> _verifyOtp() async {
    if (_otpCtrl.text.length < 4) return;
    setState(() { _loading = true; });
    _addMessage('My OTP: ${_otpCtrl.text}', 'me');
    await Future.delayed(const Duration(seconds: 1));
    _addMessage('✅ Verified! Your QueuePe account is now active.\nYou can now book standers.', 'agent');
    setState(() { _loading = false; _verified = true; });
  }

  @override
  void dispose() { _phoneCtrl.dispose(); _otpCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFECE5DD),
      appBar: AppBar(
        backgroundColor: const Color(0xFF075E54),
        title: Row(children: [
          const CircleAvatar(backgroundColor: Color(0xFF25D366), child: Icon(Icons.support_agent, color: Colors.white, size: 18)),
          const SizedBox(width: 10),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('QueuePe Support', style: GoogleFonts.notoSans(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
            Text('Online', style: GoogleFonts.notoSans(fontSize: 11, color: Colors.white70)),
          ]),
        ]),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded, color: Colors.white), onPressed: () => context.go('/client/home')),
      ),
      body: Column(children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(12),
            children: _messages.map((m) => _ChatBubble(message: m)).toList(),
          ),
        ),
        // Input area
        Container(
          color: const Color(0xFFF0F0F0),
          padding: const EdgeInsets.all(12),
          child: _verified
              ? ElevatedButton(onPressed: () => context.go('/client/home'), child: const Text('GO TO HOME'))
              : Column(children: [
                  if (!_otpSent) ...[
                    TextField(
                      controller: _phoneCtrl, keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        hintText: 'Enter your 10-digit phone number',
                        filled: true, fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(width: double.infinity, child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF25D366)),
                      onPressed: _loading ? null : _sendOtp,
                      child: _loading ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white) : const Text('SEND OTP'),
                    )),
                  ] else ...[
                    TextField(
                      controller: _otpCtrl, keyboardType: TextInputType.number, maxLength: 6,
                      decoration: InputDecoration(
                        hintText: 'Enter 6-digit OTP',
                        filled: true, fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        counterText: '',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(width: double.infinity, child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF25D366)),
                      onPressed: _loading ? null : _verifyOtp,
                      child: _loading ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white) : const Text('VERIFY OTP'),
                    )),
                  ],
                ]),
        ),
      ]),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final Map<String, String> message;
  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isMe = message['who'] == 'me';
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xFFDCF8C6) : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12), topRight: const Radius.circular(12),
            bottomLeft: isMe ? const Radius.circular(12) : Radius.zero,
            bottomRight: isMe ? Radius.zero : const Radius.circular(12),
          ),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 4, offset: const Offset(0, 1))],
        ),
        child: Text(message['text']!, style: GoogleFonts.notoSans(fontSize: 14, color: const Color(0xFF1A1612))),
      ),
    );
  }
}
