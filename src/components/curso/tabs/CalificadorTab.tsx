import React, { useState, useEffect } from 'react';
import { useAlumnos } from '@/hooks/useAlumnos';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useNotasPorAlumno, useUpdateNota, useCreateNota, Nota } from '@/hooks/useNotas';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CalificadorTabProps {
  cursoId: string;
}

export const CalificadorTab = ({ cursoId }: CalificadorTabProps) => {
  const [alumnoId, setAlumnoId] = useState('');
  const { data: alumnos = [] } = useAlumnos(cursoId);
  const { data: materias = [] } = useMaterias(cursoId);
  const { data: notasOriginales = [], isLoading: notasLoading } = useNotasPorAlumno(cursoId, alumnoId);

  const [notasEditadas, setNotasEditadas] = useState<Record<string, Partial<Nota>>>({});

  const updateNotaMutation = useUpdateNota();
  const createNotaMutation = useCreateNota();

  const debouncedNotas = useDebounce(notasEditadas, 1000);

  useEffect(() => {
    if (Object.keys(debouncedNotas).length > 0) {
      handleSaveAll();
    }
  }, [debouncedNotas]);

  const handleNotaChange = (materiaId: string, tipoEvaluacion: string, value: string) => {
    const notaExistente = notasOriginales.find(n => n.materia_id === materiaId && n.tipo_evaluacion === tipoEvaluacion);
    const key = `${materiaId}-${tipoEvaluacion}`;

    setNotasEditadas(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        id: notaExistente?.id,
        alumno_id: alumnoId,
        materia_id: materiaId,
        curso_id: cursoId,
        tipo_evaluacion: tipoEvaluacion,
        nota: value,
        fecha: new Date().toISOString(),
      }
    }));
  };

  const handleSaveAll = () => {
    Object.values(notasEditadas).forEach(nota => {
      if (nota.id) {
        updateNotaMutation.mutate({ id: nota.id, nota: nota.nota });
      } else if (nota.nota) {
        // @ts-ignore
        createNotaMutation.mutate(nota);
      }
    });
    setNotasEditadas({});
  };

  const obtenerNota = (materiaId: string, tipoEvaluacion: string) => {
    const key = `${materiaId}-${tipoEvaluacion}`;
    if (notasEditadas[key]) {
      return notasEditadas[key].nota || '';
    }
    const nota = notasOriginales.find(n => n.materia_id === materiaId && n.tipo_evaluacion === tipoEvaluacion);
    return nota ? nota.nota || '' : '';
  };
    
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Calificador</h2>
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Alumno</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            className="border rounded p-2 w-full"
            value={alumnoId}
            onChange={e => {
              setAlumnoId(e.target.value);
              setNotasEditadas({});
            }}
          >
            <option value="">Selecciona un alumno</option>
            {alumnos.filter(a => a.activo).map(alumno => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.apellido}, {alumno.nombre}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {alumnoId && (
        <div>
          <h3 className="font-semibold mt-4">Materias Regulares</h3>
          {notasLoading ? (
            <div className="text-center py-4">Cargando notas...</div>
          ) : (
            <table className="w-full border mb-8">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Materia</th>
                  <th className="border px-2 py-1">Nota 1° Cuatr.</th>
                  <th className="border px-2 py-1">Nota 2° Cuatr.</th>
                  <th className="border px-2 py-1">Prom. Anual</th>
                  <th className="border px-2 py-1">Diciembre</th>
                  <th className="border px-2 py-1">Marzo</th>
                  <th className="border px-2 py-1">Calif. Definitiva</th>
                  <th className="border px-2 py-1">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.map(materia => {
                  const nota1 = obtenerNota(materia.id, '1° Cuatrimestre');
                  const nota2 = obtenerNota(materia.id, '2° Cuatrimestre');
                  const promedio = (nota1 && nota2) ? ((parseFloat(nota1) + parseFloat(nota2)) / 2).toFixed(1) : '';

                  return (
                    <tr key={materia.id}>
                      <td className="border px-2 py-1">{materia.nombre}</td>
                      <td className="border px-2 py-1">
                        <Input
                          type="text"
                          value={obtenerNota(materia.id, '1° Cuatrimestre')}
                          onChange={e => handleNotaChange(materia.id, '1° Cuatrimestre', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input
                          type="text"
                          value={obtenerNota(materia.id, '2° Cuatrimestre')}
                          onChange={e => handleNotaChange(materia.id, '2° Cuatrimestre', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="border px-2 py-1 font-semibold">{promedio}</td>
                      <td className="border px-2 py-1">
                        <Input
                          type="text"
                          value={obtenerNota(materia.id, 'Diciembre')}
                          onChange={e => handleNotaChange(materia.id, 'Diciembre', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input
                          type="text"
                          value={obtenerNota(materia.id, 'Marzo')}
                          onChange={e => handleNotaChange(materia.id, 'Marzo', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input
                          type="text"
                          value={obtenerNota(materia.id, 'Nota Final')}
                          onChange={e => handleNotaChange(materia.id, 'Nota Final', e.target.value)}
                          className="w-20"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <Input type="text" className="border rounded p-1 w-32" placeholder="Observaciones" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}; 