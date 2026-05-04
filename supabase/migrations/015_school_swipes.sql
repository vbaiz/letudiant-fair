-- Create school_swipes table
CREATE TABLE IF NOT EXISTS public.school_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  description TEXT,
  duree_value INTEGER DEFAULT 0,
  duree_unit VARCHAR(20) DEFAULT 'mois', -- 'mois' or 'ans'
  niveau VARCHAR(100),
  modalite VARCHAR(100),
  admission VARCHAR(100),
  cout TEXT,
  couleur VARCHAR(7) DEFAULT '#932D99',
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  save_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published', -- 'draft' or 'published'
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_school_swipes_school_id ON public.school_swipes(school_id);
CREATE INDEX idx_school_swipes_status ON public.school_swipes(status);
CREATE INDEX idx_school_swipes_published_at ON public.school_swipes(published_at);

-- Enable RLS
ALTER TABLE public.school_swipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Schools can view/create/update/delete their own swipes
CREATE POLICY "schools_view_own_swipes"
  ON public.school_swipes FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.users WHERE school_id = school_swipes.school_id
  ));

CREATE POLICY "schools_create_swipes"
  ON public.school_swipes FOR INSERT
  WITH CHECK (school_id IN (
    SELECT school_id FROM public.users WHERE id = auth.uid()
  ));

CREATE POLICY "schools_update_own_swipes"
  ON public.school_swipes FOR UPDATE
  USING (school_id IN (
    SELECT school_id FROM public.users WHERE id = auth.uid()
  ));

CREATE POLICY "schools_delete_own_swipes"
  ON public.school_swipes FOR DELETE
  USING (school_id IN (
    SELECT school_id FROM public.users WHERE id = auth.uid()
  ));

-- Students can view published swipes
CREATE POLICY "students_view_published_swipes"
  ON public.school_swipes FOR SELECT
  USING (status = 'published' OR auth.uid() IN (
    SELECT user_id FROM public.users WHERE school_id = school_swipes.school_id
  ));
