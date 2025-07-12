
-- Crear tabla de usuarios (preceptores)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  iniciales TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de cursos
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anio INTEGER NOT NULL CHECK (anio >= 1 AND anio <= 7),
  division INTEGER NOT NULL CHECK (division >= 1 AND division <= 5),
  turno TEXT NOT NULL CHECK (turno IN ('mañana', 'tarde', 'noche')),
  activo BOOLEAN NOT NULL DEFAULT true
);

-- Crear tabla de alumnos
CREATE TABLE public.alumnos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) NOT NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  grupo_taller TEXT NOT NULL CHECK (grupo_taller IN ('A', 'B')),
  dni TEXT,
  fecha_nacimiento DATE,
  nacionalidad TEXT,
  direccion TEXT,
  contacto_nombre TEXT,
  contacto_tel TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de materias
CREATE TABLE public.materias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Clase', 'Taller', 'EF')),
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de módulos de materias
CREATE TABLE public.materia_modulos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  materia_id UUID REFERENCES public.materias(id) ON DELETE CASCADE NOT NULL,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  cantidad_modulos INTEGER NOT NULL CHECK (cantidad_modulos >= 1),
  grupo TEXT NOT NULL CHECK (grupo IN ('A', 'B', 'todos'))
);

-- Crear tabla de asistencias
CREATE TABLE public.asistencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id UUID REFERENCES public.alumnos(id) NOT NULL,
  modulo_id UUID REFERENCES public.materia_modulos(id) NOT NULL,
  fecha DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('P', 'A', 'T', 'J', 'SC')),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de planillas de notas
CREATE TABLE public.planillas_notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) NOT NULL,
  cuatrimestre INTEGER NOT NULL CHECK (cuatrimestre IN (1, 2)),
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generado_por_id UUID REFERENCES public.users(id) NOT NULL,
  token_url TEXT UNIQUE NOT NULL
);

-- Crear tabla de notas
CREATE TABLE public.notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planilla_id UUID REFERENCES public.planillas_notas(id) NOT NULL,
  alumno_id UUID REFERENCES public.alumnos(id) NOT NULL,
  materia_id UUID REFERENCES public.materias(id) NOT NULL,
  nota DECIMAL(4,2),
  docente_nombre TEXT,
  fecha_carga TIMESTAMP WITH TIME ZONE,
  firma TEXT,
  user_id UUID REFERENCES public.users(id),
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de actas
CREATE TABLE public.actas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES public.cursos(id) NOT NULL,
  alumno_id UUID REFERENCES public.alumnos(id),
  fecha DATE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materia_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planillas_notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para acceso completo de usuarios autenticados
CREATE POLICY "Usuarios autenticados acceso completo users" ON public.users FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo cursos" ON public.cursos FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo alumnos" ON public.alumnos FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo materias" ON public.materias FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo materia_modulos" ON public.materia_modulos FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo asistencias" ON public.asistencias FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo planillas_notas" ON public.planillas_notas FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo notas" ON public.notas FOR ALL USING (true);
CREATE POLICY "Usuarios autenticados acceso completo actas" ON public.actas FOR ALL USING (true);

-- Insertar datos de ejemplo de cursos
INSERT INTO public.cursos (anio, division, turno) VALUES
  -- 1° año (1-5)
  (1, 1, 'mañana'), (1, 2, 'mañana'), (1, 3, 'mañana'), (1, 4, 'mañana'), (1, 5, 'mañana'),
  -- 2° año (1-5)
  (2, 1, 'mañana'), (2, 2, 'mañana'), (2, 3, 'mañana'), (2, 4, 'mañana'), (2, 5, 'mañana'),
  -- 3° año (1-5)
  (3, 1, 'mañana'), (3, 2, 'mañana'), (3, 3, 'mañana'), (3, 4, 'mañana'), (3, 5, 'mañana'),
  -- 4° año (1-4)
  (4, 1, 'mañana'), (4, 2, 'mañana'), (4, 3, 'mañana'), (4, 4, 'mañana'),
  -- 5° año (1-4)
  (5, 1, 'mañana'), (5, 2, 'mañana'), (5, 3, 'mañana'), (5, 4, 'mañana'),
  -- 6° año (1-4)
  (6, 1, 'mañana'), (6, 2, 'mañana'), (6, 3, 'mañana'), (6, 4, 'mañana'),
  -- 7° año (1-4)
  (7, 1, 'mañana'), (7, 2, 'mañana'), (7, 3, 'mañana'), (7, 4, 'mañana');

-- Insertar usuario de ejemplo
INSERT INTO public.users (nombre, email, iniciales) VALUES
  ('María González', 'mgonzalez@abc.gob.ar', 'MG'),
  ('Juan Pérez', 'jperez@abc.gob.ar', 'JP'),
  ('Ana López', 'alopez@abc.gob.ar', 'AL');
