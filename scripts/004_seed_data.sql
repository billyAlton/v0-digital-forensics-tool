-- Insert sample admin user profile (you'll need to create the auth user first)
-- This is just a placeholder structure

-- Insert sample events
insert into public.events (title, description, event_type, start_date, end_date, location) values
  ('Sunday Worship Service', 'Join us for our weekly worship service with inspiring music and powerful preaching.', 'service', now() + interval '7 days', now() + interval '7 days' + interval '2 hours', 'Main Sanctuary'),
  ('Youth Night', 'An evening of fun, fellowship, and faith for our youth group.', 'youth', now() + interval '10 days', now() + interval '10 days' + interval '3 hours', 'Youth Center'),
  ('Prayer Meeting', 'Come together in prayer for our community and world.', 'prayer', now() + interval '3 days', now() + interval '3 days' + interval '1 hour', 'Prayer Room'),
  ('Bible Study', 'Deep dive into the Word with our weekly Bible study group.', 'meeting', now() + interval '5 days', now() + interval '5 days' + interval '1.5 hours', 'Fellowship Hall');

-- Insert sample sermons
insert into public.sermons (title, description, pastor_name, sermon_date, scripture_reference, series) values
  ('Walking in Faith', 'Discover what it means to truly walk by faith and not by sight.', 'Pastor John Smith', current_date - interval '7 days', 'Hebrews 11:1-6', 'Faith Series'),
  ('The Power of Prayer', 'Understanding the transformative power of prayer in our daily lives.', 'Pastor John Smith', current_date - interval '14 days', 'Matthew 6:5-15', 'Prayer Series'),
  ('Love Your Neighbor', 'Exploring what it means to love our neighbors as ourselves.', 'Pastor Sarah Johnson', current_date - interval '21 days', 'Luke 10:25-37', 'Love Series');

-- Insert sample blog posts
insert into public.blog_posts (title, slug, content, excerpt, status, published_at) values
  ('Welcome to Our Church', 'welcome-to-our-church', 'We are thrilled to welcome you to our church family. Whether you are new to faith or have been walking with God for years, there is a place for you here...', 'Join us as we explore what it means to be part of our church community.', 'published', now() - interval '5 days'),
  ('Upcoming Mission Trip', 'upcoming-mission-trip', 'We are excited to announce our upcoming mission trip to serve communities in need. Join us as we put our faith into action...', 'Learn about our mission trip and how you can get involved.', 'published', now() - interval '2 days');

-- Insert sample prayer requests
insert into public.prayer_requests (title, description, requester_name, status, is_public) values
  ('Healing for Family Member', 'Please pray for my mother who is recovering from surgery.', 'Anonymous', 'active', true),
  ('Job Search', 'Seeking prayers for guidance in finding new employment.', 'John D.', 'active', true),
  ('Community Outreach', 'Pray for our upcoming community outreach event and that hearts would be open.', 'Church Staff', 'active', true);
