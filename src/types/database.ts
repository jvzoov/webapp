// ============================================================
// QueuePe — Database TypeScript Types
// ============================================================

// ─── Enums ───────────────────────────────────────────────────
export type UserRole       = 'CLIENT' | 'STANDER' | 'ADMIN';
export type BookingStatus  = 'PENDING_MATCH' | 'MATCHED' | 'ACTIVE' | 'ALERT' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus  = 'PENDING' | 'PAID' | 'REFUNDED';
export type NotifType      = 'JOB_AVAILABLE' | 'CHECK_IN' | 'ALERT' | 'PAYMENT' | 'MATCHED';
export type LocationCat    = 'RTO' | 'PASSPORT' | 'HOSPITAL' | 'BANK' | 'COURT' | 'OTHER';

// ─── Row Types ────────────────────────────────────────────────
export interface User {
  id:               string;
  email:            string;
  phone:            string;
  name:             string;
  role:             UserRole;
  password_hash:    string | null;
  aadhaar_verified: boolean;
  avatar_initials:  string | null;
  created_at:       string;
  updated_at:       string;
}

export interface Location {
  id:             string;
  name:           string;
  icon:           string | null;
  avg_wait_hours: string | null;
  category:       LocationCat | null;
  created_at:     string;
}

export interface Booking {
  id:                   string;
  client_id:            string | null;
  stander_id:           string | null;
  location_id:          string | null;
  location_address:     string;
  start_time:           string;
  estimated_hours:      number;
  status:               BookingStatus;
  total_amount:         number;   // paise
  stander_payout:       number;   // paise
  platform_fee:         number;   // paise
  razorpay_order_id:    string | null;
  razorpay_payment_id:  string | null;
  payment_status:       PaymentStatus;
  instructions:         string | null;
  created_at:           string;
  updated_at:           string;
}

export interface CheckIn {
  id:                 string;
  booking_id:         string | null;
  stander_id:         string | null;
  latitude:           number;
  longitude:          number;
  selfie_url:         string | null;
  queue_position:     number | null;
  estimated_minutes:  number | null;
  is_alert:           boolean;
  created_at:         string;
}

export interface Review {
  id:         string;
  booking_id: string | null;
  client_id:  string | null;
  stander_id: string | null;
  rating:     number | null;
  comment:    string | null;
  created_at: string;
}

export interface StanderProfile {
  id:              string;
  user_id:         string;
  total_earnings:  number;   // paise
  job_count:       number;
  rating:          number;
  on_time_percent: number;
  current_streak:  number;
  is_online:       boolean;
  upi_id:          string | null;
  created_at:      string;
}

export interface Notification {
  id:         string;
  user_id:    string | null;
  type:       NotifType | null;
  message:    string;
  is_read:    boolean;
  created_at: string;
}

// ─── Composite Types ──────────────────────────────────────────
export interface BookingWithDetails extends Booking {
  location:   Location | null;
  client:     Pick<User, 'id' | 'name' | 'avatar_initials' | 'phone'> | null;
  stander:    Pick<User, 'id' | 'name' | 'avatar_initials' | 'phone'> | null;
  review:     Review | null;
  check_ins?: CheckIn[];
}

export interface StanderWithProfile extends User {
  stander_profiles: StanderProfile;
}

// ─── Supabase Database type (for typed clients) ───────────────
export type Database = {
  public: {
    Tables: {
      users: {
        Row:    User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<User, 'id'>>;
      };
      locations: {
        Row:    Location;
        Insert: Omit<Location, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Location, 'id'>>;
      };
      bookings: {
        Row:    Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<Booking, 'id'>>;
      };
      check_ins: {
        Row:    CheckIn;
        Insert: Omit<CheckIn, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<CheckIn, 'id'>>;
      };
      reviews: {
        Row:    Review;
        Insert: Omit<Review, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Review, 'id'>>;
      };
      stander_profiles: {
        Row:    StanderProfile;
        Insert: Omit<StanderProfile, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<StanderProfile, 'id'>>;
      };
      notifications: {
        Row:    Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<Notification, 'id'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role:       UserRole;
      booking_status:  BookingStatus;
      payment_status:  PaymentStatus;
      notif_type:      NotifType;
      location_cat:    LocationCat;
    };
  };
};
