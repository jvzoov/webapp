import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

class BookScreen extends StatefulWidget {
  final String location;
  const BookScreen({super.key, required this.location});

  @override
  State<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends State<BookScreen> {
  final _nameCtrl = TextEditingController();
  final _detailsCtrl = TextEditingController();
  String _selectedService = 'Standard Queue';
  int _estimatedWait = 30;
  bool _isLoading = false;
  String? _error;

  final _services = ['Standard Queue', 'Priority Queue', 'Document Submission', 'Token Collection'];

  double get _price => _selectedService == 'Priority Queue' ? 599 : 349;

  Future<void> _confirmBooking() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Please enter your name');
      return;
    }
    setState(() { _isLoading = true; _error = null; });
    try {
      final user = Supabase.instance.client.auth.currentUser;
      final clientId = user?.id ?? 'demo-client';
      final booking = await SupabaseService.createBooking(
        clientId: clientId,
        locationName: widget.location.isEmpty ? 'Custom Location' : widget.location,
        locationType: 'standard',
        estimatedWaitMin: _estimatedWait,
      );
      if (mounted) context.go('/client/track/${booking['id']}');
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _detailsCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('BOOK A STANDER'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_rounded), onPressed: () => context.go('/client/home')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Location Display
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.saffronSoft,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.saffron.withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on, color: AppTheme.saffron, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('LOCATION', style: GoogleFonts.notoSans(fontSize: 10, color: AppTheme.ink3, letterSpacing: 1)),
                        Text(
                          widget.location.isEmpty ? 'Custom Location' : widget.location,
                          style: GoogleFonts.notoSans(fontSize: 15, fontWeight: FontWeight.w600, color: AppTheme.ink),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Form
            Text('BOOKING DETAILS', style: GoogleFonts.bebasNeue(fontSize: 18, color: AppTheme.ink, letterSpacing: 1.5)),
            const SizedBox(height: 12),

            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(labelText: 'Your Name', prefixIcon: Icon(Icons.person_outline)),
            ),
            const SizedBox(height: 12),

            TextField(
              controller: _detailsCtrl,
              maxLines: 2,
              decoration: const InputDecoration(labelText: 'Special Instructions (optional)', prefixIcon: Icon(Icons.note_outlined)),
            ),
            const SizedBox(height: 16),

            Text('SERVICE TYPE', style: GoogleFonts.notoSans(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.ink2)),
            const SizedBox(height: 8),

            Container(
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: _services.asMap().entries.map((e) {
                  final isSelected = e.value == _selectedService;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedService = e.value),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? AppTheme.saffronSoft : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          Icon(isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                              color: isSelected ? AppTheme.saffron : AppTheme.ink3, size: 20),
                          const SizedBox(width: 10),
                          Text(e.value, style: GoogleFonts.notoSans(fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400, color: AppTheme.ink)),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 20),

            // Wait time slider
            Text('ESTIMATED WAIT: $_estimatedWait MIN', style: GoogleFonts.bebasNeue(fontSize: 16, color: AppTheme.ink, letterSpacing: 1)),
            Slider(
              value: _estimatedWait.toDouble(),
              min: 10,
              max: 120,
              divisions: 11,
              activeColor: AppTheme.saffron,
              label: '$_estimatedWait min',
              onChanged: (v) => setState(() => _estimatedWait = v.round()),
            ),
            const SizedBox(height: 16),

            // Pricing
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppTheme.border),
              ),
              child: Column(
                children: [
                  _PriceRow(label: 'Service fee', value: '₹${(_price * 0.8).toStringAsFixed(0)}'),
                  _PriceRow(label: 'Platform fee', value: '₹${(_price * 0.2).toStringAsFixed(0)}'),
                  const Divider(),
                  _PriceRow(label: 'TOTAL', value: '₹${_price.toStringAsFixed(0)}', bold: true),
                ],
              ),
            ),
            const SizedBox(height: 16),

            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.redSoft, borderRadius: BorderRadius.circular(8)),
                child: Text(_error!, style: GoogleFonts.notoSans(color: AppTheme.red, fontSize: 13)),
              ),

            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _confirmBooking,
                child: _isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('CONFIRM BOOKING'),
              ),
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  const _PriceRow({required this.label, required this.value, this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.notoSans(fontWeight: bold ? FontWeight.w700 : FontWeight.w400, color: bold ? AppTheme.ink : AppTheme.ink2)),
          Text(value, style: GoogleFonts.jetBrainsMono(fontWeight: bold ? FontWeight.w700 : FontWeight.w500, color: bold ? AppTheme.saffron : AppTheme.ink2)),
        ],
      ),
    );
  }
}
