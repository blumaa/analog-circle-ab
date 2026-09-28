-- Column guard triggers call private.* helpers as the calling role. The service
-- role (seed script, admin tooling) needs schema usage to reach them; the
-- helpers then exempt it from the guards (private.is_end_user).
grant usage on schema private to service_role;
