
-- Actualizar las políticas RLS para usar auth.uid() en lugar de user_id directo

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo users" ON public.users;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo cursos" ON public.cursos;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo alumnos" ON public.alumnos;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo materias" ON public.materias;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo materia_modulos" ON public.materia_modulos;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo asistencias" ON public.asistencias;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo planillas_notas" ON public.planillas_notas;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo notas" ON public.notas;
DROP POLICY IF EXISTS "Usuarios autenticados acceso completo actas" ON public.actas;

-- Crear nuevas políticas usando auth.uid()

-- Políticas para users (solo pueden ver/editar su propio perfil)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para cursos (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can view cursos" ON public.cursos
  FOR SELECT TO authenticated USING (true);

-- Políticas para alumnos (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage alumnos" ON public.alumnos
  FOR ALL TO authenticated USING (true);

-- Políticas para materias (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage materias" ON public.materias
  FOR ALL TO authenticated USING (true);

-- Políticas para materia_modulos (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage materia_modulos" ON public.materia_modulos
  FOR ALL TO authenticated USING (true);

-- Políticas para asistencias (solo pueden crear/ver las que registraron)
CREATE POLICY "Users can view all asistencias" ON public.asistencias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create asistencias" ON public.asistencias
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own asistencias" ON public.asistencias
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Políticas para planillas_notas (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage planillas_notas" ON public.planillas_notas
  FOR ALL TO authenticated USING (true);

-- Políticas para notas (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage notas" ON public.notas
  FOR ALL TO authenticated USING (true);

-- Políticas para actas (solo pueden crear/ver las que registraron)
CREATE POLICY "Users can view all actas" ON public.actas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create actas" ON public.actas
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own actas" ON public.actas
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Función para manejar nuevos usuarios registrados
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, nombre, email, iniciales)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)), 2))
  );
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
