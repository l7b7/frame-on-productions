-- Execute ONE selected block at a time in the Supabase SQL Editor.
-- Replace the example email/name with an existing Supabase Auth user's details.
-- Create the email/password account in Authentication > Users first.
-- Passwords are managed by Supabase Auth; never insert passwords in this table.

-- 1. Grant or restore content administration to an existing account.
select public.frame_grant_admin('team@example.com', 'اسم عضو الفريق');

-- 2. Revoke access, including API access from an already signed-in session.
-- Select and execute this block ONLY when you intend to revoke this user.
-- update public.frame_admins set is_active = false
-- where user_id in (select id from auth.users where lower(email) = lower('team@example.com'));

-- 3. Review accounts. This query returns no password or session token.
-- select a.display_name, u.email, a.is_active, a.created_at
-- from public.frame_admins a join auth.users u on u.id = a.user_id
-- order by a.created_at;
