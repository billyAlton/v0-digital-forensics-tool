-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add updated_at triggers to relevant tables
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_events
  before update on public.events
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_sermons
  before update on public.sermons
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_blog_posts
  before update on public.blog_posts
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_prayer_requests
  before update on public.prayer_requests
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_volunteers
  before update on public.volunteers
  for each row
  execute function public.handle_updated_at();

-- Function to increment prayer count
create or replace function public.increment_prayer_count()
returns trigger
language plpgsql
as $$
begin
  update public.prayer_requests
  set prayer_count = prayer_count + 1
  where id = new.prayer_request_id;
  return new;
end;
$$;

-- Trigger to increment prayer count
create trigger increment_prayer_count_trigger
  after insert on public.prayer_interactions
  for each row
  execute function public.increment_prayer_count();

-- Function to increment sermon views
create or replace function public.increment_sermon_views(sermon_id uuid)
returns void
language plpgsql
as $$
begin
  update public.sermons
  set views = views + 1
  where id = sermon_id;
end;
$$;

-- Function to increment blog post views
create or replace function public.increment_blog_views(post_id uuid)
returns void
language plpgsql
as $$
begin
  update public.blog_posts
  set views = views + 1
  where id = post_id;
end;
$$;
