// ============================================================
// QueuePe Mobile — Client WhatsApp OTP Screen
// WhatsApp Business thread with OTP generation and verification
// ============================================================

import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class ClientWhatsAppScreen extends StatefulWidget {
  const ClientWhatsAppScreen({super.key});

  @override
  State<ClientWhatsAppScreen> createState() => _ClientWhatsAppScreenState();
}

class _ClientWhatsAppScreenState extends State<ClientWhatsAppScreen> {
  final _otpCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final List<_ChatMsg> _messages = [
    _ChatMsg('Hi! We can verify your QueuePe account using WhatsApp OTP.', false),
  ];
  String _otpCode = '------';
  int _countdown = 0;
  Timer? _timer;

  void _appendMsg(String text, {bool isMe = false}) {
    setState(() => _messages.add(_ChatMsg(text, isMe)));
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendOTP() {
    final code = (100000 + Random().nextInt(900000)).toString();
    setState(() {
      _otpCode = code;
      _countdown = 45;
    });
    _appendMsg('Your QueuePe verification OTP is $code. It is valid for 45 seconds.');
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() {
        _countdown--;
        if (_countdown <= 0) {
          t.cancel();
          _appendMsg('OTP expired. Tap send again for a new code.');
        }
      });
    });
  }

  void _verifyOTP() {
    final val = _otpCtrl.text.trim();
    if (_countdown == 0 || _otpCode == '------') {
      _appendMsg('Verification failed because the OTP expired.', isMe: true);
      return;
    }
    if (val == _otpCode) {
      _appendMsg('Entered OTP $val and completed phone verification.', isMe: true);
      _appendMsg('Phone number verified successfully. Alerts are now active.');
      _timer?.cancel();
      setState(() => _countdown = 0);
    } else {
      _appendMsg('Entered OTP ${val.isEmpty ? 'empty' : val} but verification failed.', isMe: true);
      _appendMsg('That code does not match. Please retry.');
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('WhatsApp Business', style: AppText.sectionTitle),
          const SizedBox(height: 14),

          // ─── Thread Card ──────────────────────────────
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.border, width: 1.5),
              borderRadius: BorderRadius.circular(AppRadius.card),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('QueuePe Support', style: AppText.cardTitle),
                        Text('Business verified thread', style: AppText.chipWait),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.greenSoft,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text('LIVE', style: AppText.mono(10, color: AppColors.green)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Chat thread
                Container(
                  height: 260,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFEAE2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListView.builder(
                    controller: _scrollCtrl,
                    itemCount: _messages.length,
                    itemBuilder: (ctx, i) {
                      final m = _messages[i];
                      return Align(
                        alignment: m.isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.65),
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: m.isMe ? const Color(0xFFDCF8C6) : Colors.white,
                            borderRadius: BorderRadius.only(
                              topLeft: const Radius.circular(12),
                              topRight: const Radius.circular(12),
                              bottomLeft: Radius.circular(m.isMe ? 12 : 4),
                              bottomRight: Radius.circular(m.isMe ? 4 : 12),
                            ),
                          ),
                          child: Text(m.text, style: AppText.body(13, height: 1.45)),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),

                // OTP display
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('GENERATED OTP', style: AppText.formLabel),
                        const SizedBox(height: 4),
                        Text(_otpCode, style: AppText.display(42, color: AppColors.saffron).copyWith(letterSpacing: 3)),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.amberSoft,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        _countdown > 0 ? '${_countdown}s remaining' : 'Expired / Idle',
                        style: AppText.mono(11, color: AppColors.amber),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                ElevatedButton(
                  onPressed: _sendOTP,
                  child: Text('SEND WHATSAPP OTP', style: AppText.buttonText),
                ),
                const SizedBox(height: 12),

                Text('ENTER 6-DIGIT OTP', style: AppText.formLabel),
                const SizedBox(height: 6),
                TextField(
                  controller: _otpCtrl,
                  maxLength: 6,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    hintText: '123456',
                    counterText: '',
                  ),
                ),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: _verifyOTP,
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.ink),
                  child: Text('VERIFY OTP', style: AppText.buttonText),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // ─── Notification Preferences ─────────────────
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.border, width: 1.5),
              borderRadius: BorderRadius.circular(AppRadius.card),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('NOTIFICATION PREFERENCES', style: AppText.sectionLabel),
                const SizedBox(height: 10),
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  mainAxisSpacing: 10,
                  crossAxisSpacing: 10,
                  childAspectRatio: 1.6,
                  children: ['Queue updates', 'Payment alerts', 'Geo-fence alerts', 'Voice confirms'].map((pref) =>
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        border: Border.all(color: AppColors.border, width: 1.5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(pref, style: AppText.body(13, weight: FontWeight.w600)),
                          const SizedBox(height: 4),
                          SizedBox(
                            height: 20, width: 36,
                            child: Switch(
                              value: true,
                              onChanged: (_) {},
                              activeColor: AppColors.saffron,
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMsg {
  final String text;
  final bool isMe;
  _ChatMsg(this.text, this.isMe);
}
