-- Create table to store school closure days
CREATE TABLE public.dias_sin_clase (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL,
  fecha DATE NOT NULL,
  motivo TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  UNIQUE(curso_id, fecha)
);

-- Enable RLS
ALTER TABLE public.dias_sin_clase ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can manage dias_sin_clase" 
ON public.dias_sin_clase 
FOR ALL 
USING (true);