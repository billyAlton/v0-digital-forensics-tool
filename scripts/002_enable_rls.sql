-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.sermons enable row level security;
alter table public.blog_posts enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.prayer_interactions enable row level security;
alter table public.donations enable row level security;
alter table public.volunteers enable row level security;
alter table public.contact_messages enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Events policies
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Admins and pastors can create events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can update events"
  on public.events for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

-- Event registrations policies
create policy "Users can view their own registrations"
  on public.event_registrations for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

create policy "Authenticated users can register for events"
  on public.event_registrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own registrations"
  on public.event_registrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own registrations"
  on public.event_registrations for delete
  using (auth.uid() = user_id);

-- Sermons policies
create policy "Sermons are viewable by everyone"
  on public.sermons for select
  using (true);

create policy "Admins and pastors can create sermons"
  on public.sermons for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can update sermons"
  on public.sermons for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can delete sermons"
  on public.sermons for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

-- Blog posts policies
create policy "Published blog posts are viewable by everyone"
  on public.blog_posts for select
  using (status = 'published' or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

create policy "Admins and pastors can create blog posts"
  on public.blog_posts for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can update blog posts"
  on public.blog_posts for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can delete blog posts"
  on public.blog_posts for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

-- Prayer requests policies
create policy "Public prayer requests are viewable by everyone"
  on public.prayer_requests for select
  using (is_public = true or auth.uid() = requester_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

create policy "Authenticated users can create prayer requests"
  on public.prayer_requests for insert
  with check (auth.uid() = requester_id or requester_id is null);

create policy "Users can update their own prayer requests"
  on public.prayer_requests for update
  using (auth.uid() = requester_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

create policy "Users can delete their own prayer requests"
  on public.prayer_requests for delete
  using (auth.uid() = requester_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

-- Prayer interactions policies
create policy "Users can view prayer interactions"
  on public.prayer_interactions for select
  using (true);

create policy "Authenticated users can add prayer interactions"
  on public.prayer_interactions for insert
  with check (auth.uid() = user_id);

-- Donations policies
create policy "Users can view their own donations"
  on public.donations for select
  using (auth.uid() = donor_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

create policy "Anyone can create donations"
  on public.donations for insert
  with check (true);

create policy "Admins can update donations"
  on public.donations for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Volunteers policies
create policy "Admins and pastors can view all volunteers"
  on public.volunteers for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    ) or auth.uid() = user_id
  );

create policy "Users can register as volunteers"
  on public.volunteers for insert
  with check (auth.uid() = user_id);

create policy "Users can update their volunteer info"
  on public.volunteers for update
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'pastor')
  ));

-- Contact messages policies
create policy "Anyone can create contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Admins and pastors can view contact messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );

create policy "Admins and pastors can update contact messages"
  on public.contact_messages for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'pastor')
    )
  );
