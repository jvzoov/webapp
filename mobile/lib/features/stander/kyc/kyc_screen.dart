import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class KycScreen extends StatefulWidget {
  const KycScreen({super.key});
  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  final _idNumberCtrl = TextEditingController();
  String _selectedIdType = 'Aadhaar';
  bool _loading = false;
  bool _submitted = false;
  int _step = 0;

  final _idTypes = ['Aadhaar', 'PAN Card', 'Voter ID', 'Passport', 'Driving License'];

  Future<void> _submit() async {
    if (_idNumberCtrl.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final user = Supabase.instance.client.auth.currentUser;
      await SupabaseService.submitKyc(
        standerId: user?.id ?? 'demo',
        idType: _selectedIdType,
        idNumber: _idNumberCtrl.text.trim(),
      );
      setState(() { _submitted = true; _loading = false; });
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() { _idNumberCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('KYC VERIFICATION')),
      body: _submitted ? _SuccessView() : SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Steps
          Container(
            padding: const EdgeInsets.all(16), margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border)),
            child: Row(children: [
              _StepDot(num: 1, label: 'ID Type', active: _step >= 0),
              Expanded(child: Container(height: 2, color: _step >= 1 ? AppTheme.saffron : AppTheme.border)),
              _StepDot(num: 2, label: 'Details', active: _step >= 1),
              Expanded(child: Container(height: 2, color: _step >= 2 ? AppTheme.saffron : AppTheme.border)),
              _StepDot(num: 3, label: 'Review', active: _step >= 2),
            ]),
          ),

          Text('SELECT ID TYPE', style: GoogleFonts.bebasNeue(fontSize: 18, color: AppTheme.ink, letterSpacing: 1.5)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8, runSpacing: 8,
            children: _idTypes.map((t) {
              final sel = t == _selectedIdType;
              return GestureDetector(
                onTap: () => setState(() { _selectedIdType = t; _step = 1; }),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: sel ? AppTheme.saffron : AppTheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: sel ? AppTheme.saffron : AppTheme.border),
                  ),
                  child: Text(t, style: GoogleFonts.notoSans(fontSize: 13, fontWeight: FontWeight.w500, color: sel ? Colors.white : AppTheme.ink)),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          Text('$_selectedIdType NUMBER', style: GoogleFonts.bebasNeue(fontSize: 18, color: AppTheme.ink, letterSpacing: 1.5)),
          const SizedBox(height: 10),
          TextField(
            controller: _idNumberCtrl,
            onChanged: (_) => setState(() => _step = 2),
            decoration: InputDecoration(
              labelText: 'Enter $_selectedIdType number',
              prefixIcon: const Icon(Icons.credit_card_outlined),
            ),
          ),
          const SizedBox(height: 20),

          // Selfie placeholder
          GestureDetector(
            onTap: () {},
            child: Container(
              width: double.infinity, height: 100,
              decoration: BoxDecoration(color: AppTheme.bg2, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.border, style: BorderStyle.solid)),
              child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.camera_alt_outlined, color: AppTheme.ink3, size: 28),
                const SizedBox(height: 6),
                Text('Upload Selfie with ID (optional)', style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3)),
              ]),
            ),
          ),
          const SizedBox(height: 24),

          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: AppTheme.amberSoft, borderRadius: BorderRadius.circular(8)),
            child: Row(children: [
              const Icon(Icons.lock_outline, color: AppTheme.amber, size: 16),
              const SizedBox(width: 8),
              Expanded(child: Text('Your data is encrypted and used only for verification', style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink2))),
            ]),
          ),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white) : const Text('SUBMIT KYC'),
            ),
          ),
          const SizedBox(height: 100),
        ]),
      ),
    );
  }
}

class _StepDot extends StatelessWidget {
  final int num; final String label; final bool active;
  const _StepDot({required this.num, required this.label, required this.active});

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 28, height: 28, decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: active ? AppTheme.saffron : AppTheme.bg3,
        ),
        child: Center(child: Text('$num', style: TextStyle(color: active ? Colors.white : AppTheme.ink3, fontWeight: FontWeight.w700, fontSize: 12))),
      ),
      const SizedBox(height: 4),
      Text(label, style: GoogleFonts.notoSans(fontSize: 10, color: active ? AppTheme.saffron : AppTheme.ink3)),
    ]);
  }
}

class _SuccessView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            padding: const EdgeInsets.all(24), decoration: const BoxDecoration(color: AppTheme.greenSoft, shape: BoxShape.circle),
            child: const Icon(Icons.verified, color: AppTheme.green, size: 56),
          ),
          const SizedBox(height: 24),
          Text('KYC SUBMITTED!', style: GoogleFonts.bebasNeue(fontSize: 32, color: AppTheme.ink)),
          const SizedBox(height: 8),
          Text('Your KYC is under review.\nWe\'ll notify you within 24 hours.', style: GoogleFonts.notoSans(color: AppTheme.ink3), textAlign: TextAlign.center),
          const SizedBox(height: 32),
          ElevatedButton(onPressed: () => context.go('/stander/home'), child: const Text('GO TO JOBS')),
        ]),
      ),
    );
  }
}
