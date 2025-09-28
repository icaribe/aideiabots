-- Fix function search_path security issues
ALTER FUNCTION public.update_daily_metrics() SET search_path = public;
ALTER FUNCTION public.update_user_bot_count() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;