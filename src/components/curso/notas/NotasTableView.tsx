
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { Nota, useDeleteNota } from '@/hooks/useNotas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NotaBadge } from './NotaBadge';
import { TipoBadge } from './TipoBadge';

interface NotasTableViewProps {
  notas: Nota[];
  onEdit: (nota: Nota) => void;
  onEditNotaFinal?: (nota: Nota) => void;
}

export const NotasTableView = ({ notas, onEdit, onEditNotaFinal }: NotasTableViewProps) => {
  const deleteNota = useDeleteNota();

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta nota?')) {
      deleteNota.mutate(id);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Alumno</TableHead>
            <TableHead>Materia</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Nota</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Observaciones</TableHead>
            <TableHead className="w-20">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No hay notas registradas
              </TableCell>
            </TableRow>
          ) : (
            notas.map((nota) => (
              <TableRow key={nota.id}>
                <TableCell className="font-medium">
                  {nota.alumno?.apellido}, {nota.alumno?.nombre}
                </TableCell>
                <TableCell>{nota.materia?.nombre}</TableCell>
                <TableCell><TipoBadge tipo={nota.tipo_evaluacion} /></TableCell>
                <TableCell><NotaBadge nota={nota.nota} /></TableCell>
                <TableCell>
                  {format(new Date(nota.fecha), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell className="max-w-48 truncate">
                  {nota.observaciones || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (nota.tipo_evaluacion === 'Nota Final' && onEditNotaFinal) {
                          onEditNotaFinal(nota);
                        } else {
                          onEdit(nota);
                        }
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(nota.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
