// ============================================================
// QueuePe Mobile — Client Book Screen
// Booking form with location, address, time, price preview
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class ClientBookScreen extends StatefulWidget {
  const ClientBookScreen({super.key});

  @override
  State<ClientBookScreen> createState() => _ClientBookScreenState();
}

class _ClientBookScreenState extends State<ClientBookScreen> {
  final _locationCtrl   = TextEditingController(text: 'RTO Office');
  final _addressCtrl    = TextEditingController(text: 'RTO Office, Koramangala');
  final _nameCtrl       = TextEditingController(text: 'Priya Sharma');
  final _phoneCtrl      = TextEditingController(text: '+91 98765 43210');
  String _purpose       = 'Driving Licence Renewal';
  String _startTime     = '08:00';
  int    _hours         = 2;

  int get _total => _hours * 200 + 49;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ─── Header ─────────────────────────────────────
          Row(
            children: [
              _BackButton(onTap: () => context.go('/client/home')),
              const SizedBox(width: 10),
              Text('Book a Stander', style: AppText.sectionTitle),
            ],
          ),
          const SizedBox(height: 20),

          // ─── Form Card ──────────────────────────────────
          _FormCard(
            children: [
              _FormField(label: 'QUEUE LOCATION', child: TextField(
                controller: _locationCtrl,
                decoration: const InputDecoration(hintText: 'e.g. RTO Office'),
              )),
              _FormField(label: 'EXACT ADDRESS / OFFICE NAME', child: TextField(
                controller: _addressCtrl,
                decoration: const InputDecoration(hintText: 'e.g. RTO Koramangala'),
              )),
              _FormField(label: 'PURPOSE OF VISIT', child: DropdownButtonFormField<String>(
                value: _purpose,
                decoration: const InputDecoration(),
                items: const [
                  DropdownMenuItem(value: 'Driving Licence Renewal', child: Text('Driving Licence Renewal')),
                  DropdownMenuItem(value: 'Vehicle Registration',    child: Text('Vehicle Registration')),
                  DropdownMenuItem(value: 'Passport Application',    child: Text('Passport Application')),
                  DropdownMenuItem(value: 'Bank Account Opening',    child: Text('Bank Account Opening')),
                  DropdownMenuItem(value: 'Hospital OPD Token',      child: Text('Hospital OPD Token')),
                  DropdownMenuItem(value: 'Other',                   child: Text('Other')),
                ],
                onChanged: (v) => setState(() => _purpose = v!),
              )),

              // Time row
              Row(
                children: [
                  Expanded(child: _FormField(label: 'START TIME', child: GestureDetector(
                    onTap: () async {
                      final picked = await showTimePicker(
                        context: context,
                        initialTime: const TimeOfDay(hour: 8, minute: 0),
                      );
                      if (picked != null) {
                        setState(() => _startTime = '${picked.hour.toString().padLeft(2, '0')}:${picked.minute.toString().padLeft(2, '0')}');
                      }
                    },
                    child: AbsorbPointer(
                      child: TextField(
                        decoration: InputDecoration(hintText: _startTime),
                        controller: TextEditingController(text: _startTime),
                      ),
                    ),
                  ))),
                  const SizedBox(width: 10),
                  Expanded(child: _FormField(label: 'EST. HOURS', child: DropdownButtonFormField<int>(
                    value: _hours,
                    decoration: const InputDecoration(),
                    items: List.generate(5, (i) => DropdownMenuItem(
                      value: i + 1,
                      child: Text('${i + 1} hour${i > 0 ? 's' : ''}'),
                    )),
                    onChanged: (v) => setState(() => _hours = v!),
                  ))),
                ],
              ),

              _FormField(label: 'YOUR NAME', child: TextField(controller: _nameCtrl)),
              _FormField(label: 'MOBILE NUMBER', child: TextField(
                controller: _phoneCtrl,
                keyboardType: TextInputType.phone,
              )),
            ],
          ),

          const SizedBox(height: 12),

          // ─── Price Preview ──────────────────────────────
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.saffronSoft,
              border: Border.all(color: AppColors.saffron.withOpacity(0.3), width: 1.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Estimated Cost', style: AppText.body(13, color: AppColors.ink2)),
                    const SizedBox(height: 2),
                    Text(
                      '₹200/hr × $_hours hrs + ₹49 booking fee',
                      style: AppText.body(11, color: AppColors.ink3),
                    ),
                  ],
                ),
                Text('₹$_total', style: AppText.priceDisplay),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ─── Guarantees ─────────────────────────────────
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bg2,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '✓ Stander stays until your turn or time is up\n'
              '✓ Geo-verified check-ins every 30 minutes\n'
              '✓ Instant WhatsApp alert when your turn approaches\n'
              '✓ Full refund if no Stander matched within 20 min',
              style: AppText.body(12, color: AppColors.ink3, height: 1.6),
            ),
          ),

          const SizedBox(height: 12),

          // ─── Extra Actions ──────────────────────────────
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.push('/client/voice'),
                  child: Text('VOICE BOOK', style: AppText.buttonText.copyWith(
                    color: AppColors.ink, fontSize: 14,
                  )),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  onPressed: () => context.go('/client/whatsapp'),
                  child: Text('WHATSAPP OTP', style: AppText.buttonText.copyWith(
                    color: AppColors.ink, fontSize: 14,
                  )),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ─── Pay Button ─────────────────────────────────
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Booking confirmed — ₹$_total paid'),
                    backgroundColor: AppColors.ink,
                  ),
                );
                context.go('/client/track');
              },
              child: Text('PAY ₹$_total & CONFIRM', style: AppText.buttonText),
            ),
          ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

// ─── Helper Widgets ─────────────────────────────────────────
class _BackButton extends StatelessWidget {
  final VoidCallback onTap;
  const _BackButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          color: AppColors.bg2,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Center(child: Text('←', style: TextStyle(fontSize: 18))),
      ),
    );
  }
}

class _FormCard extends StatelessWidget {
  final List<Widget> children;
  const _FormCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border, width: 1.5),
        borderRadius: BorderRadius.circular(AppRadius.card),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: children,
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final String label;
  final Widget child;
  const _FormField({required this.label, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppText.formLabel),
          const SizedBox(height: 6),
          child,
        ],
      ),
    );
  }
}
