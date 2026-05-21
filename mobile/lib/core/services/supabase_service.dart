import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static final _client = Supabase.instance.client;

  // ── Auth ──────────────────────────────────────────────
  static Future<void> signInWithPhone(String phone) async {
    await _client.auth.signInWithOtp(phone: phone);
  }

  static Future<AuthResponse> verifyOtp(String phone, String token) async {
    return await _client.auth.verifyOTP(
      phone: phone,
      token: token,
      type: OtpType.sms,
    );
  }

  // ── Bookings ──────────────────────────────────────────
  static Future<Map<String, dynamic>> createBooking({
    required String clientId,
    required String locationName,
    required String locationType,
    required int estimatedWaitMin,
  }) async {
    final res = await _client.from('bookings').insert({
      'client_id': clientId,
      'location_name': locationName,
      'location_type': locationType,
      'estimated_wait_min': estimatedWaitMin,
      'status': 'WAITING',
    }).select().single();
    return res;
  }

  static Future<List<Map<String, dynamic>>> getClientBookings(String clientId) async {
    return await _client
        .from('bookings')
        .select('*, standers(name, phone, rating)')
        .eq('client_id', clientId)
        .order('created_at', ascending: false);
  }

  static Future<Map<String, dynamic>?> getBooking(String bookingId) async {
    return await _client
        .from('bookings')
        .select('*, standers(name, phone, rating)')
        .eq('id', bookingId)
        .maybeSingle();
  }

  static Future<void> updateBookingStatus(String bookingId, String status) async {
    await _client.from('bookings').update({'status': status}).eq('id', bookingId);
  }

  // ── Stander Jobs ──────────────────────────────────────
  static Future<List<Map<String, dynamic>>> getAvailableJobs() async {
    return await _client
        .from('bookings')
        .select('*, clients(name)')
        .eq('status', 'WAITING')
        .order('created_at', ascending: true);
  }

  static Future<void> acceptJob(String bookingId, String standerId) async {
    await _client.from('bookings').update({
      'stander_id': standerId,
      'status': 'ACTIVE',
    }).eq('id', bookingId);
  }

  static Future<Map<String, dynamic>?> getStanderProfile(String standerId) async {
    return await _client.from('standers').select().eq('id', standerId).maybeSingle();
  }

  static Future<List<Map<String, dynamic>>> getStanderEarnings(String standerId) async {
    return await _client
        .from('bookings')
        .select('id, created_at, payout_amount, location_name, status')
        .eq('stander_id', standerId)
        .eq('status', 'DONE')
        .order('created_at', ascending: false);
  }

  // ── Check-ins ─────────────────────────────────────────
  static Future<void> logCheckIn({
    required String bookingId,
    required String standerId,
    required double lat,
    required double lng,
    String? note,
  }) async {
    await _client.from('check_ins').insert({
      'booking_id': bookingId,
      'stander_id': standerId,
      'lat': lat,
      'lng': lng,
      'note': note ?? 'Check-in logged',
    });
  }

  static Future<List<Map<String, dynamic>>> getCheckIns(String bookingId) async {
    return await _client
        .from('check_ins')
        .select()
        .eq('booking_id', bookingId)
        .order('created_at', ascending: false);
  }

  // ── Notifications ─────────────────────────────────────
  static Future<void> sendNotification({
    required String userId,
    required String title,
    required String body,
    String type = 'info',
  }) async {
    await _client.from('notifications').insert({
      'user_id': userId,
      'title': title,
      'body': body,
      'type': type,
    });
  }

  // ── KYC ───────────────────────────────────────────────
  static Future<void> submitKyc({
    required String standerId,
    required String idType,
    required String idNumber,
    String? selfieUrl,
    String? idFrontUrl,
  }) async {
    await _client.from('kyc_submissions').upsert({
      'stander_id': standerId,
      'id_type': idType,
      'id_number': idNumber,
      'selfie_url': selfieUrl,
      'id_front_url': idFrontUrl,
      'status': 'PENDING',
    });
  }

  // ── Realtime Subscriptions ────────────────────────────
  static RealtimeChannel subscribeToBooking(
    String bookingId,
    void Function(Map<String, dynamic> payload) onUpdate,
  ) {
    return _client
        .channel('booking:$bookingId')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'bookings',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'id',
            value: bookingId,
          ),
          callback: (payload) => onUpdate(payload.newRecord),
        )
        .subscribe();
  }

  static RealtimeChannel subscribeToCheckIns(
    String bookingId,
    void Function(Map<String, dynamic> payload) onInsert,
  ) {
    return _client
        .channel('checkins:$bookingId')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'check_ins',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'booking_id',
            value: bookingId,
          ),
          callback: (payload) => onInsert(payload.newRecord),
        )
        .subscribe();
  }

  static RealtimeChannel subscribeToAvailableJobs(
    void Function(Map<String, dynamic> payload) onChange,
  ) {
    return _client
        .channel('jobs:available')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'bookings',
          callback: (payload) => onChange(payload.newRecord),
        )
        .subscribe();
  }
}
