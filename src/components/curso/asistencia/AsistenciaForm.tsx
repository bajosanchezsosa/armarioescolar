
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { EstadoAsistencia, Materia, Alumno } from '@/types/database';
import { useAsistencias, useBulkUpdateAsistencias, useAsistenciasLog } from '@/hooks/useAsistencias';
import { useMateriaModulos } from '@/hooks/useMateriaQueries';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { AsistenciaHeader } from './AsistenciaHeader';
import { AsistenciaStats } from './AsistenciaStats';
import { GroupedAttendanceTable } from './GroupedAttendanceTable';
import { MobileGroupedAttendance } from './MobileGroupedAttendance';
import { ClassStatusControls } from './ClassStatusControls';
import { AsistenciaFooter } from './AsistenciaFooter';

interface AsistenciaFormProps {
  materias: Materia[];
  alumnos: Alumno[];
  cursoId: string;
}

// Función para obtener la fecha actual en zona horaria de Buenos Aires
const getBuenosAiresDate = () => {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
};

export const AsistenciaForm = ({ materias, alumnos, cursoId }: AsistenciaFormProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(getBuenosAiresDate());
  const [selectedMateria, setSelectedMateria] = useState<string>('');
  const [asistencias, setAsistencias] = useState<Record<string, EstadoAsistencia>>({});
  const [sinClase, setSinClase] = useState(false);
  const [sinClaseGrupos, setSinClaseGrupos] = useState<Record<string, boolean>>({});

  // Obtener módulos para todas las materias
  const materiasConModulos = materias.map(materia => {
    const { data: modulos = [] } = useMateriaModulos(materia.id);
    return { ...materia, modulos };
  });

  // Obtener la materia seleccionada
  const materiaSeleccionada = materiasConModulos.find(m => m.id === selectedMateria);

  // Filtrar materias por día de la semana seleccionado
  const materiasDelDia = materiasConModulos.filter(materia => {
    if (materia.modulos.length === 0) return true;
    
    const diaSemana = selectedDate.getDay();
    const diaSemanaSql = diaSemana === 0 ? 7 : diaSemana;
    
    return materia.modulos.some(modulo => modulo.dia_semana === diaSemanaSql);
  });

  // Obtener grupos que tienen clase en el día seleccionado para la materia seleccionada
  const gruposConClaseHoy = materiaSeleccionada ? (() => {
    const diaSemana = selectedDate.getDay();
    const diaSemanaSql = diaSemana === 0 ? 7 : diaSemana;
    
    const modulosDelDia = materiaSeleccionada.modulos.filter(
      modulo => modulo.dia_semana === diaSemanaSql
    );
    
    return [...new Set(modulosDelDia.map(m => m.grupo))];
  })() : [];

  const { data: existingAsistencias = [] } = useAsistencias(
    selectedMateria, 
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  );

  const { data: asistenciasLog = [] } = useAsistenciasLog(
    cursoId,
    selectedMateria,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  );
  
  const bulkUpdateMutation = useBulkUpdateAsistencias();


  // Determinar si es un taller (requiere separación por grupos)
  const esTaller = materiaSeleccionada?.tipo === 'Taller';
  
  // Obtener grupos únicos para esta materia (solo los que tienen clase hoy)
  const gruposUnicos = gruposConClaseHoy;

  // Initialize attendance with "P" for all students by default
  useEffect(() => {
    if (selectedMateria && alumnos.length > 0) {
      const defaultData: Record<string, EstadoAsistencia> = {};
      
      alumnos.forEach(alumno => {
        defaultData[alumno.id] = 'P';
      });

      if (existingAsistencias.length > 0) {
        existingAsistencias.forEach(asistencia => {
          defaultData[asistencia.alumno_id] = asistencia.estado as EstadoAsistencia;
        });
      }
      
      setAsistencias(defaultData);
      setSinClase(false);
      setSinClaseGrupos({});
    }
  }, [selectedMateria, alumnos, existingAsistencias]);

  // Reset selected materia when date changes if not available for new day
  useEffect(() => {
    if (selectedMateria && !materiasDelDia.find(m => m.id === selectedMateria)) {
      setSelectedMateria('');
    }
  }, [selectedDate, selectedMateria, materiasDelDia]);

  const handleEstadoChange = (alumnoId: string, estado: EstadoAsistencia) => {
    setAsistencias(prev => ({
      ...prev,
      [alumnoId]: estado
    }));
  };

  const handleSinClaseToggle = () => {
    setSinClase(!sinClase);
    if (!sinClase) {
      // Al marcar sin clase, marcar como 'SC' (Sin Clase)
      const newAsistencias: Record<string, EstadoAsistencia> = {};
      alumnos.forEach(alumno => {
        newAsistencias[alumno.id] = 'SC'; // Marcar como Sin Clase
      });
      setAsistencias(newAsistencias);
    }
  };

  const handleSinClaseGrupoChange = (grupo: string, sinClase: boolean) => {
    setSinClaseGrupos(prev => ({
      ...prev,
      [grupo]: sinClase
    }));
    
    if (sinClase) {
      // Al marcar sin clase para este grupo, marcar todos como 'SC' (Sin Clase)
      const newAsistencias = { ...asistencias };
      alumnos
        .filter(alumno => alumno.grupo_taller === grupo)
        .forEach(alumno => {
          newAsistencias[alumno.id] = 'SC';
        });
      setAsistencias(newAsistencias);
    }
  };

  const handleMarkAllPresent = () => {
    const newAsistencias: Record<string, EstadoAsistencia> = {};
    alumnos.forEach(alumno => {
      newAsistencias[alumno.id] = 'P';
    });
    setAsistencias(newAsistencias);
  };

  const handleMarkAllAbsent = () => {
    const newAsistencias: Record<string, EstadoAsistencia> = {};
    alumnos.forEach(alumno => {
      newAsistencias[alumno.id] = 'A';
    });
    setAsistencias(newAsistencias);
  };

  const handleSave = async () => {
    if (!selectedMateria || !selectedDate || !user) return;

    const asistenciasToUpdate = alumnos.map(alumno => {
      // Determinar si este alumno está en un grupo marcado como "sin clase"
      const grupoSinClase = esTaller ? sinClaseGrupos[alumno.grupo_taller] : sinClase;
      const estadoFinal = grupoSinClase ? 'SC' : (asistencias[alumno.id] || 'P');
      // Logging para debug
      console.log(`=== DEBUG GUARDAR ASISTENCIA ===`);
      console.log(`Alumno: ${alumno.apellido}, ${alumno.nombre}`);
      console.log(`Estado en formulario: ${asistencias[alumno.id] || 'P'}`);
      console.log(`Grupo sin clase: ${grupoSinClase}`);
      console.log(`Estado final a guardar: ${estadoFinal}`);
      console.log(`=== FIN DEBUG GUARDAR ===`);
      return {
        alumnoId: alumno.id,
        materiaId: selectedMateria,
        fecha: format(selectedDate, 'yyyy-MM-dd'),
        estado: estadoFinal,
        userId: user.id,
        cursoId: cursoId,
      };
    });

    console.log(`Datos a enviar:`, asistenciasToUpdate);
    bulkUpdateMutation.mutate(asistenciasToUpdate, {
      onSuccess: (data) => {
        console.log('✅ Asistencias guardadas en Supabase:', data);
      },
      onError: (error) => {
        console.error('❌ Error al guardar asistencias en Supabase:', error);
      }
    });
  };

  const contarEstados = () => {
    let presentes = 0;
    let ausentes = 0;
    let tardanzas = 0;
    let justificados = 0;

    alumnos.forEach(alumno => {
      const grupoSinClase = esTaller ? sinClaseGrupos[alumno.grupo_taller] : sinClase;
      
        const estado = asistencias[alumno.id] || 'P';
        switch (estado) {
          case 'P': presentes++; break;
          case 'A': ausentes++; break;
          case 'T': tardanzas++; break;
          case 'J': justificados++; break;
        case 'SC': /* No contar como presente ni ausente */ break;
      }
    });

    return { presentes, ausentes, tardanzas, justificados };
  };

  const estadisticas = contarEstados();

  return (
    <div className="space-y-6">
      <AsistenciaHeader
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedMateria={selectedMateria}
        setSelectedMateria={setSelectedMateria}
        materias={materiasDelDia}
      />

      {materiasDelDia.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay materias programadas para este día</p>
          <p className="text-sm">Selecciona otro día o configura los horarios de las materias</p>
        </div>
      )}

      {selectedMateria && alumnos.length > 0 && materiasDelDia.length > 0 && (
        <>
          <AsistenciaStats
            presentes={estadisticas.presentes}
            ausentes={estadisticas.ausentes}
            tardanzas={estadisticas.tardanzas}
            justificados={estadisticas.justificados}
          />

          {!esTaller && (
            <ClassStatusControls
              sinClase={sinClase}
              onSinClaseToggle={handleSinClaseToggle}
              onMarkAllPresent={handleMarkAllPresent}
              onMarkAllAbsent={handleMarkAllAbsent}
            />
          )}

          <div className="space-y-4">
            {esTaller ? (
              // Para talleres, mostrar grupos separados con control individual de "sin clase"
              gruposUnicos.map(grupo => {
                // Filtrar alumnos solo del grupo que tiene clase hoy
                const alumnosDelGrupo = alumnos.filter(alumno => alumno.grupo_taller === grupo);
                
                return isMobile ? (
                  <MobileGroupedAttendance
                    key={grupo}
                    alumnos={alumnosDelGrupo}
                    asistencias={asistencias}
                    onEstadoChange={handleEstadoChange}
                    grupo={grupo as any}
                    onSinClaseChange={handleSinClaseGrupoChange}
                    sinClaseGrupos={sinClaseGrupos}
                  />
                ) : (
                  <GroupedAttendanceTable
                    key={grupo}
                    alumnos={alumnosDelGrupo}
                    asistencias={asistencias}
                    onEstadoChange={handleEstadoChange}
                    grupo={grupo as any}
                    onSinClaseChange={handleSinClaseGrupoChange}
                    sinClaseGrupos={sinClaseGrupos}
                  />
                );
              })
            ) : (
              // Para clases y EF, mostrar todo junto
              isMobile ? (
                <MobileGroupedAttendance
                  alumnos={alumnos}
                  asistencias={asistencias}
                  onEstadoChange={handleEstadoChange}
                  grupo="todos"
                  sinClase={sinClase}
                />
              ) : (
                <GroupedAttendanceTable
                  alumnos={alumnos}
                  asistencias={asistencias}
                  onEstadoChange={handleEstadoChange}
                  grupo="todos"
                  sinClase={sinClase}
                />
              )
            )}
          </div>

          <AsistenciaFooter
            onSave={handleSave}
            isSaving={bulkUpdateMutation.isPending}
            asistenciasLog={asistenciasLog}
          />
        </>
      )}

      {selectedMateria && alumnos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay alumnos en este curso</p>
          <p className="text-sm">Agrega alumnos en la pestaña Alumnos</p>
        </div>
      )}
    </div>
  );
};
