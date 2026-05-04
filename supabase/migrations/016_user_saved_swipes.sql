-- Create user_saved_swipes table for tracking saved school swipes
CREATE TABLE IF NOT EXISTS public.user_saved_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  swipe_id UUID NOT NULL REFERENCES public.school_swipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, swipe_id)
);

-- Enable RLS
ALTER TABLE public.user_saved_swipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "users_view_own_saved_swipes"
  ON public.user_saved_swipes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "users_create_saved_swipes"
  ON public.user_saved_swipes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_saved_swipes"
  ON public.user_saved_swipes FOR DELETE
  USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX idx_user_saved_swipes_user_id ON public.user_saved_swipes(user_id);
CREATE INDEX idx_user_saved_swipes_swipe_id ON public.user_saved_swipes(swipe_id);
