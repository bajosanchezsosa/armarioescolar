import { Input } from '@/components/ui/input';

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  activo: boolean;
}

interface Materia {
  id: string;
  nombre: string;
  tipo: string;
}

interface RegistroManualTableProps {
  alumnos: Alumno[];
  materias: Materia[];
  getNotaValue: (alumnoId: string, materiaId: string) => string;
  getNotaStatus: (alumnoId: string, materiaId: string) => string;
  onNotaChange: (alumnoId: string, materiaId: string, value: string) => void;
}

export const RegistroManualTable = ({
  alumnos,
  materias,
  getNotaValue,
  getNotaStatus,
  onNotaChange
}: RegistroManualTableProps) => {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-900 border-r">
              Alumno
            </th>
            {materias.map(materia => (
              <th key={materia.id} className="px-3 py-3 text-center text-sm font-medium text-gray-900 min-w-[120px]">
                <div>
                  <div className="font-medium">{materia.nombre}</div>
                  <div className="text-xs text-gray-500 font-normal">({materia.tipo})</div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {alumnos.map((alumno, index) => (
            <tr key={alumno.id} className="hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-4 py-3 border-r">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {alumno.apellido}, {alumno.nombre}
                  </p>
                  <p className="text-xs text-gray-500">
                    #{index + 1}
                  </p>
                </div>
              </td>
              {materias.map(materia => {
                const status = getNotaStatus(alumno.id, materia.id);
                const cellClass = {
                  empty: 'bg-white',
                  approved: 'bg-green-50',
                  failed: 'bg-red-50',
                  neutral: 'bg-blue-50'
                }[status];
                
                return (
                  <td key={materia.id} className={`px-3 py-2 ${cellClass}`}>
                    <Input
                      value={getNotaValue(alumno.id, materia.id)}
                      onChange={(e) => onNotaChange(alumno.id, materia.id, e.target.value)}
                      className="w-full text-center border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300"
                      placeholder="-"
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};