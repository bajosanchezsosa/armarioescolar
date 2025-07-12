
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alumno } from '@/types/database';
import { useUpdateAlumno } from '@/hooks/useAlumnos';

interface GrupoSwitchProps {
  alumno: Alumno;
}

export const GrupoSwitch = ({ alumno }: GrupoSwitchProps) => {
  const updateAlumno = useUpdateAlumno();

  const handleToggleGrupo = () => {
    const nuevoGrupo = alumno.grupo_taller === 'A' ? 'B' : 'A';
    updateAlumno.mutate({
      id: alumno.id,
      updates: { grupo_taller: nuevoGrupo }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={alumno.grupo_taller === 'A' ? 'default' : 'secondary'}>
        Grupo {alumno.grupo_taller}
      </Badge>
      <Switch
        checked={alumno.grupo_taller === 'B'}
        onCheckedChange={handleToggleGrupo}
        disabled={updateAlumno.isPending}
        className="ml-2"
      />
    </div>
  );
};
