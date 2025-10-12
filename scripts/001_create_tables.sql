-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role text default 'member' check (role in ('admin', 'pastor', 'volunteer', 'member')),
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  event_type text not null check (event_type in ('service', 'meeting', 'special', 'youth', 'prayer')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  location text,
  image_url text,
  max_attendees integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Event registrations
create table if not exists public.event_registrations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'registered' check (status in ('registered', 'attended', 'cancelled')),
  created_at timestamp with time zone default now(),
  unique(event_id, user_id)
);

-- Sermons table
create table if not exists public.sermons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  pastor_name text not null,
  sermon_date date not null,
  scripture_reference text,
  video_url text,
  audio_url text,
  transcript text,
  thumbnail_url text,
  series text,
  tags text[],
  views integer default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Blog posts table
create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  featured_image text,
  author_id uuid references auth.users(id) on delete set null,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamp with time zone,
  tags text[],
  views integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Prayer requests table
create table if not exists public.prayer_requests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  requester_name text,
  requester_id uuid references auth.users(id) on delete set null,
  status text default 'active' check (status in ('active', 'answered', 'archived')),
  is_anonymous boolean default false,
  is_public boolean default true,
  prayer_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Prayer interactions (who prayed for what)
create table if not exists public.prayer_interactions (
  id uuid primary key default uuid_generate_v4(),
  prayer_request_id uuid references public.prayer_requests(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  unique(prayer_request_id, user_id)
);

-- Donations table
create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  donor_id uuid references auth.users(id) on delete set null,
  donor_name text,
  donor_email text,
  amount decimal(10, 2) not null,
  currency text default 'USD',
  donation_type text not null check (donation_type in ('tithe', 'offering', 'mission', 'building', 'other')),
  payment_method text check (payment_method in ('card', 'bank', 'cash', 'check')),
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_id text,
  notes text,
  is_recurring boolean default false,
  created_at timestamp with time zone default now()
);

-- Volunteers table
create table if not exists public.volunteers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  department text not null check (department in ('worship', 'children', 'youth', 'hospitality', 'media', 'prayer', 'outreach', 'other')),
  availability text[],
  skills text[],
  status text default 'active' check (status in ('active', 'inactive', 'on_leave')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Contact messages table
create table if not exists public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index if not exists idx_events_start_date on public.events(start_date);
create index if not exists idx_sermons_date on public.sermons(sermon_date desc);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_prayer_requests_status on public.prayer_requests(status);
create index if not exists idx_donations_donor on public.donations(donor_id);
