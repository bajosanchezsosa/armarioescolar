import React, { useState, useEffect } from 'react';
import { Materia, MateriaModulo } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HorarioGridProps {
  materias: Materia[];
}

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Horarios correctos con módulos de 1 hora y recreos reales
const TODOS_LOS_HORARIOS = [
  '07:30', '08:30', 
  // Recreo 9:30-9:45
  '09:45', '10:45', 
  // Recreo 11:45-11:50
  '11:50', 
  // Recreo 12:50-13:00
  '13:00', '14:00',
  // Recreo 15:00-15:15
  '15:15', '16:15', 
  // Recreo 17:15-17:30
  '17:30', '18:30', 
  // Recreo 19:30-19:40
  '19:40', '20:40'
];

const MateriaCell = ({ materia, grupo }: { materia: Materia; grupo?: string }) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Clase':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'Taller':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'EF':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className={`p-2 rounded border-2 text-xs h-full flex flex-col justify-center ${getTipoColor(materia.tipo)}`}>
      <div className="font-semibold">{materia.nombre}</div>
      {grupo && grupo !== 'todos' && (
        <div className="text-xs opacity-75">Grupo {grupo}</div>
      )}
      {grupo === 'todos' && (
        <div className="text-xs opacity-75">Todo el curso</div>
      )}
    </div>
  );
};

export const HorarioGrid = ({ materias }: HorarioGridProps) => {
  const [horarioMap, setHorarioMap] = useState<{ 
    [key: string]: { 
      materia: Materia; 
      grupo: string;
    }[] 
  }>({});
  const [materiasWithModulos, setMateriasWithModulos] = useState<Array<{
    materia: Materia;
    modulos: MateriaModulo[];
  }>>([]);

  // Cargar módulos para todas las materias de forma segura
  const materiaIds = materias.map(m => m.id);
  
  // Usar useQuery para cada materia de forma individual y segura
  useEffect(() => {
    const loadModulos = async () => {
      if (!materias.length) {
        setMateriasWithModulos([]);
        return;
      }

      const results = await Promise.all(
        materias.map(async (materia) => {
          const { data: modulos } = await supabase
            .from('materia_modulos')
            .select('*')
            .eq('materia_id', materia.id)
            .order('dia_semana', { ascending: true })
            .order('hora_inicio', { ascending: true });
          
          return { materia, modulos: modulos || [] };
        })
      );
      
      setMateriasWithModulos(results);
    };

    loadModulos();
  }, [materiaIds.join(',')]); // Dependencia basada en IDs de materias

  useEffect(() => {
    console.log('Materias con módulos para grilla:', materiasWithModulos);
    
    const newHorarioMap: typeof horarioMap = {};

    materiasWithModulos.forEach(({ materia, modulos }) => {
      console.log(`Procesando ${materia.nombre}:`, modulos);
      
      modulos.forEach(modulo => {
        const horaInicio = modulo.hora_inicio.substring(0, 5); // Formato HH:MM
        const cantidadModulos = modulo.cantidad_modulos;
        
        console.log(`Procesando módulo de ${materia.nombre}:`, {
          dia: modulo.dia_semana,
          hora: horaInicio,
          modulos: cantidadModulos,
          grupo: modulo.grupo
        });
        
        // Encontrar el índice de la hora de inicio
        const indiceHoraInicio = TODOS_LOS_HORARIOS.indexOf(horaInicio);
        
        if (indiceHoraInicio === -1) {
          console.warn(`Hora ${horaInicio} no encontrada en horarios para ${materia.nombre}. Horarios disponibles:`, TODOS_LOS_HORARIOS);
          return;
        }

        // Ocupar las celdas correspondientes según la cantidad de módulos
        for (let i = 0; i < cantidadModulos; i++) {
          const indiceHora = indiceHoraInicio + i;
          
          if (indiceHora >= TODOS_LOS_HORARIOS.length) {
            console.warn(`Módulo excede horarios disponibles para ${materia.nombre}`);
            break;
          }
          
          const hora = TODOS_LOS_HORARIOS[indiceHora];
          const key = `${modulo.dia_semana}-${hora}`;
          
          console.log(`Agregando a mapa: ${key} - ${materia.nombre} (${modulo.grupo})`);
          
          if (!newHorarioMap[key]) {
            newHorarioMap[key] = [];
          }

          // Agregar la materia a esta celda
          newHorarioMap[key].push({
            materia,
            grupo: modulo.grupo
          });
        }
      });
    });

    console.log('Mapa de horarios generado:', newHorarioMap);
    setHorarioMap(newHorarioMap);
  }, [materiasWithModulos.map(m => `${m.materia.id}-${m.modulos.length}`).join(',')]);

  // Determinar el rango de horarios a mostrar
  const getHorariosAMostrar = () => {
    if (Object.keys(horarioMap).length === 0) {
      return TODOS_LOS_HORARIOS.slice(0, 8);
    }

    const horariosConMaterias = new Set<string>();
    
    Object.keys(horarioMap).forEach(key => {
      const [, hora] = key.split('-');
      horariosConMaterias.add(hora);
    });

    if (horariosConMaterias.size === 0) {
      return TODOS_LOS_HORARIOS.slice(0, 8);
    }

    const horariosArray = Array.from(horariosConMaterias).sort();
    const primerHorario = horariosArray[0];
    const ultimoHorario = horariosArray[horariosArray.length - 1];

    const indicePrimero = TODOS_LOS_HORARIOS.indexOf(primerHorario);
    const indiceUltimo = TODOS_LOS_HORARIOS.indexOf(ultimoHorario);

    const inicio = Math.max(0, indicePrimero - 1);
    const fin = Math.min(TODOS_LOS_HORARIOS.length - 1, indiceUltimo + 2);

    return TODOS_LOS_HORARIOS.slice(inicio, fin + 1);
  };

  const horariosAMostrar = getHorariosAMostrar();

  const renderCelda = (dia: number, hora: string) => {
    const key = `${dia}-${hora}`;
    const materiasEnCelda = horarioMap[key] || [];

    if (materiasEnCelda.length === 0) {
      return <div className="h-16 border border-gray-200 bg-gray-50"></div>;
    }

    // Separar por grupo si hay talleres
    const talleres = materiasEnCelda.filter(({ materia }) => materia.tipo === 'Taller');
    const otros = materiasEnCelda.filter(({ materia }) => materia.tipo !== 'Taller');

    if (talleres.length > 0) {
      const grupoA = talleres.filter(({ grupo }) => grupo === 'A');
      const grupoB = talleres.filter(({ grupo }) => grupo === 'B');

      return (
        <div className="h-16 border border-gray-200 flex">
          <div className="flex-1 p-1 border-r border-gray-200">
            {grupoA.length > 0 ? (
              <MateriaCell materia={grupoA[0].materia} grupo="A" />
            ) : (
              <div className="text-xs text-gray-400 text-center h-full flex items-center justify-center">A</div>
            )}
          </div>
          <div className="flex-1 p-1">
            {grupoB.length > 0 ? (
              <MateriaCell materia={grupoB[0].materia} grupo="B" />
            ) : (
              <div className="text-xs text-gray-400 text-center h-full flex items-center justify-center">B</div>
            )}
          </div>
        </div>
      );
    }

    // Para materias tipo "Clase" o "EF" (grupo = 'todos')
    return (
      <div className="h-16 border border-gray-200 p-1">
        {otros.length > 0 && (
          <MateriaCell materia={otros[0].materia} grupo={otros[0].grupo} />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Grilla Horaria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header con días */}
            <div className="grid grid-cols-6 gap-1 mb-2">
              <div className="p-2 text-center font-semibold bg-gray-100 rounded">
                <Clock className="h-4 w-4 mx-auto mb-1" />
                Hora
              </div>
              {DIAS_SEMANA.slice(1).map(dia => (
                <div key={dia} className="p-2 text-center font-semibold bg-gray-100 rounded">
                  {dia}
                </div>
              ))}
            </div>

            {/* Grilla con horarios */}
            {horariosAMostrar.map(hora => (
              <div key={hora} className="grid grid-cols-6 gap-1 mb-1">
                <div className="p-2 text-center font-mono text-sm bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                  {hora}
                </div>
                {[1, 2, 3, 4, 5].map(dia => (
                  <div key={`${dia}-${hora}`}>
                    {renderCelda(dia, hora)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Clase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
            <span>Taller</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>Educación Física</span>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <strong>Debug:</strong> Materias: {materias?.length || 0} | 
          Con módulos: {materiasWithModulos.filter(m => m.modulos.length > 0).length} | 
          Horarios ocupados: {Object.keys(horarioMap).length} | 
          Módulos totales: {materiasWithModulos.reduce((acc, m) => acc + m.modulos.length, 0)}
        </div>
      </CardContent>
    </Card>
  );
};
