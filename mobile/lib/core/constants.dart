// ============================================================
// QueuePe Mobile — App Constants
// ============================================================

class AppConstants {
  AppConstants._();

  static const String appName = 'QueuePe';
  static const String tagline = "India's Queue Problem, Solved";

  // Pricing
  static const int ratePerHourPaise = 20000; // ₹200/hr
  static const int bookingFeePaise  = 4900;  // ₹49

  // Stander match timeout
  static const int matchTimeoutMinutes = 20;

  // Check-in interval
  static const int checkinIntervalMinutes = 30;

  // Geofence
  static const double geofenceRadiusMeters = 50.0;

  // API paths (relative to Supabase)
  static const String bookingsTable    = 'bookings';
  static const String locationsTable   = 'locations';
  static const String usersTable       = 'users';
  static const String checkInsTable    = 'check_ins';
  static const String reviewsTable     = 'reviews';
  static const String notificationsTable = 'notifications';
  static const String standerProfilesTable = 'stander_profiles';
  static const String otpSessionsTable = 'otp_sessions';
}
