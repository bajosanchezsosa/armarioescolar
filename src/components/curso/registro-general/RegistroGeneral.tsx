import React, { useEffect, useState } from 'react';
import { format, getDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAlumnos } from '@/hooks/useAlumnos';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useMateriaModulos } from '@/hooks/useMateriaQueries';
import { useRegistroGeneralData } from '@/hooks/useRegistroGeneral';
import { supabase } from '@/integrations/supabase/client';
import { Materia, MateriaModulo } from '@/types/database';
import { calcularInasistenciasDia } from '@/utils/asistenciaCalculations';

interface RegistroGeneralProps {
  cursoId: string;
}

const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const inicialesMateria = (tipo: string) => {
  if (tipo === 'Clase') return 'C';
  if (tipo === 'Taller') return 'T';
  if (tipo === 'EF') return 'EF';
  return '';
};

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const RegistroGeneral: React.FC<RegistroGeneralProps> = ({ cursoId }) => {
  // Estado para mes y año seleccionados
  const hoy = new Date();
  const [selectedYear, setSelectedYear] = useState(hoy.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(hoy.getMonth());

  // Hooks de datos
  const { data: alumnos = [], isLoading: loadingAlumnos } = useAlumnos(cursoId);
  const { data: materias = [], isLoading: loadingMaterias } = useMaterias(cursoId);
  // const { data: modulos = [] } = useMaterias(cursoId, true); // true para traer modulos

  // Estado para módulos por materia
  const [modulosPorMateria, setModulosPorMateria] = useState<Record<string, MateriaModulo[]>>({});
  const [modulosCargados, setModulosCargados] = useState(false);

  // Cargar módulos de todas las materias cuando cambian las materias
  useEffect(() => {
    if (!materias.length) {
      setModulosPorMateria({});
      setModulosCargados(true);
      return;
    }
    setModulosCargados(false);
    const fetchAllModulos = async () => {
      const out: Record<string, MateriaModulo[]> = {};
      for (const materia of materias) {
        const { data: modulos, error } = await supabase
          .from('materia_modulos')
          .select('*')
          .eq('materia_id', materia.id)
          .order('dia_semana', { ascending: true })
          .order('hora_inicio', { ascending: true });
        out[materia.id] = modulos || [];
      }
      setModulosPorMateria(out);
      setModulosCargados(true);
    };
    fetchAllModulos();
  }, [materias]);

  // Calcular días hábiles del mes seleccionado (lunes a viernes)
  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth));
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const workingDays = allDays.filter(day => {
    const d = getDay(day);
    return d >= 1 && d <= 5; // Lunes a Viernes
  });

  // Traer asistencias del mes
  const { data: registroData = {} } = useRegistroGeneralData(
    cursoId,
    workingDays
  );

  // Helper: materias que hay ese día (por tipo)
  const materiasDelDia = (date: Date) => {
    const diaSemana = getDay(date) === 0 ? 7 : getDay(date); // 1=Lunes
    return materias.filter(materia => {
      const mods = modulosPorMateria[materia.id] || [];
      return mods.some(mod => mod.dia_semana === diaSemana);
    });
  };

  // Helper: tipos de materia únicos por día
  const tiposMateriaDelDia = (date: Date) => {
    const tipos = new Set<string>();
    materiasDelDia(date).forEach(m => tipos.add(m.tipo));
    return Array.from(tipos);
  };

  // Ordenar alumnos alfabéticamente
  const alumnosOrdenados = [...alumnos].sort((a, b) => {
    if (a.apellido < b.apellido) return -1;
    if (a.apellido > b.apellido) return 1;
    if (a.nombre < b.nombre) return -1;
    if (a.nombre > b.nombre) return 1;
    return 0;
  });

  if (loadingAlumnos || loadingMaterias || !modulosCargados) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center gap-4 mb-4">
        <label className="font-semibold">Mes:</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedMonth}
          onChange={e => setSelectedMonth(Number(e.target.value))}
        >
          {meses.map((mes, idx) => (
            <option key={mes} value={idx}>{mes}</option>
          ))}
        </select>
        <label className="font-semibold">Año:</label>
        <select
          className="border rounded px-2 py-1"
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
        >
          {Array.from({ length: 6 }, (_, i) => hoy.getFullYear() - 2 + i).map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-white z-10 border-r-2 border-gray-200 px-2 py-1">Alumno</th>
            {workingDays.map((day, idx) => {
              const dia = diasSemana[getDay(day)];
              const num = format(day, 'd');
              const tiposHoy = tiposMateriaDelDia(day);
              return (
                <th key={idx} className="text-center px-2 py-1 min-w-[60px] border-b">
                  <div className="text-xs font-bold">{dia}</div>
                  <div className="text-base">{num}</div>
                  <div className="flex justify-center gap-1 text-[10px] mt-1">
                    {tiposHoy.map(tipo => (
                      <span key={tipo} className="px-1 rounded bg-gray-100 border text-gray-700">
                        {inicialesMateria(tipo)}
                      </span>
                    ))}
                  </div>
                </th>
              );
            })}
            <th className="bg-blue-50 font-bold px-2 py-1 border-l">Total</th>
          </tr>
        </thead>
        <tbody>
          {alumnosOrdenados.map(alumno => {
            let totalInasistencias = 0;
            return (
              <tr key={alumno.id}>
                <td className="sticky left-0 bg-white z-10 border-r-2 border-gray-200 px-2 py-1 font-medium">
                  {alumno.apellido}, {alumno.nombre}
                  <div className="text-xs text-gray-500">Grupo {alumno.grupo_taller}</div>
                </td>
                {workingDays.map((day, idx) => {
                  const fecha = format(day, 'yyyy-MM-dd');
                  // LOG para depuración
                  const materiasHoy = materiasDelDia(day);
                  console.log('Día:', fecha, 'Alumno:', alumno.apellido, alumno.nombre, 'Materias del día:', materiasHoy.map(m => m.nombre), 'Módulos:', materiasHoy.map(m => modulosPorMateria[m.id]));
                  const inasistencia = calcularInasistenciasDia(
                    alumno.id,
                    fecha,
                    registroData,
                    materias,
                    modulosPorMateria,
                    alumno.grupo_taller
                  );
                  console.log('Inasistencia calculada:', inasistencia, 'para', alumno.apellido, alumno.nombre, 'en', fecha);
                  if (inasistencia.tipo !== 'vacio') {
                    totalInasistencias += inasistencia.valor;
                  }
                  let bg = 'bg-gray-50';
                  let text = 'text-gray-400';
                  if (inasistencia.tipo === 'presente-todo') {
                    bg = 'bg-green-50';
                    text = 'text-green-600';
                  } else if (inasistencia.tipo === 'ausente-todo') {
                    bg = 'bg-red-50';
                    text = 'text-red-600 font-bold';
                  } else if (inasistencia.tipo === 'ausente-clase' || inasistencia.tipo === 'ausente-taller' || inasistencia.tipo === 'ausente-ef') {
                    bg = 'bg-orange-50';
                    text = 'text-orange-600 font-bold';
                  }
                  let simbolo = '-';
                  if (inasistencia.tipo === 'presente-todo') simbolo = '✔️';
                  if (inasistencia.tipo === 'ausente-todo') simbolo = 'A';
                  if (inasistencia.tipo === 'ausente-clase') simbolo = 'C';
                  if (inasistencia.tipo === 'ausente-taller') simbolo = 'T';
                  if (inasistencia.tipo === 'ausente-ef') simbolo = 'EF';
                  return (
                    <td key={idx} className={`text-center align-middle ${bg} ${text} px-2 py-1 border`}> 
                      {simbolo}
                    </td>
                  );
                })}
                <td className="text-center font-bold bg-blue-50 border-l">
                  {totalInasistencias % 1 === 0 ? totalInasistencias : totalInasistencias.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RegistroGeneral; 