// ============================================================
// QueuePe — Complete Database Type Definitions
// ============================================================

export type UserRole = 'CLIENT' | 'STANDER' | 'ADMIN';
export type BookingStatus = 'PENDING_MATCH' | 'MATCHED' | 'ACTIVE' | 'ALERT' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type NotificationType = 'JOB_AVAILABLE' | 'CHECK_IN' | 'ALERT' | 'PAYMENT' | 'MATCHED';

export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: UserRole;
  password_hash: string | null;
  aadhaar_verified: boolean;
  avatar_initials: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  icon: string | null;
  avg_wait_hours: string | null;
  category: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  stander_id: string | null;
  location_id: string;
  location_address: string;
  start_time: string;
  estimated_hours: number;
  status: BookingStatus;
  total_amount: number; // in paise
  stander_payout: number; // in paise
  platform_fee: number; // in paise
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: PaymentStatus;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  booking_id: string;
  stander_id: string;
  latitude: number;
  longitude: number;
  selfie_url: string | null;
  queue_position: number | null;
  estimated_minutes: number | null;
  is_alert: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  stander_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface StanderProfile {
  id: string;
  user_id: string;
  total_earnings: number;
  job_count: number;
  rating: number;
  on_time_percent: number;
  current_streak: number;
  is_online: boolean;
  upi_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─── Joined Types ───────────────────────────────────────────

export interface BookingWithDetails extends Booking {
  location: Location;
  client: Pick<User, 'id' | 'name' | 'avatar_initials' | 'phone'>;
  stander: Pick<User, 'id' | 'name' | 'avatar_initials' | 'phone'> | null;
  stander_profile: Pick<StanderProfile, 'rating' | 'job_count' | 'total_earnings'> | null;
  check_ins: CheckIn[];
  review: Review | null;
}

// ─── Database Helper ────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<User, 'id'>>;
      };
      locations: {
        Row: Location;
        Insert: Omit<Location, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Location, 'id'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Booking, 'id'>>;
      };
      check_ins: {
        Row: CheckIn;
        Insert: Omit<CheckIn, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<CheckIn, 'id'>>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Review, 'id'>>;
      };
      stander_profiles: {
        Row: StanderProfile;
        Insert: Omit<StanderProfile, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<StanderProfile, 'id'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Notification, 'id'>>;
      };
      otp_sessions: {
        Row: {
          id: string;
          phone: string;
          otp_hash: string;
          expires_at: string;
          attempts: number;
          created_at: string;
        };
        Insert: Omit<{ id: string; phone: string; otp_hash: string; expires_at: string; attempts: number; created_at: string; }, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<{ id: string; phone: string; otp_hash: string; expires_at: string; attempts: number; created_at: string; }, 'id'>>;
      };
    };
  };
}
