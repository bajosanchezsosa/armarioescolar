
import React from 'react';
import { Alumno } from '@/types/database';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, MapPin, GraduationCap } from 'lucide-react';
import { GrupoSwitch } from './GrupoSwitch';

interface AlumnosTableProps {
  alumnos: Alumno[];
  onEdit: (alumno: Alumno) => void;
  onDelete: (alumno: Alumno) => void;
  onPromote: (alumno: Alumno) => void;
}

export const AlumnosTable = ({ alumnos, onEdit, onDelete, onPromote }: AlumnosTableProps) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  if (alumnos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay alumnos registrados en este curso.</p>
        <p className="text-sm">Utiliza el botón "Agregar Alumno" para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre y Apellido</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alumnos.map((alumno) => (
            <TableRow key={alumno.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {alumno.nombre} {alumno.apellido}
                  </div>
                  {alumno.direccion && (
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {alumno.direccion}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {alumno.dni || '-'}
              </TableCell>
              <TableCell>
                <div>
                  <div>{calculateAge(alumno.fecha_nacimiento)}</div>
                  {alumno.fecha_nacimiento && (
                    <div className="text-sm text-gray-500">
                      {formatDate(alumno.fecha_nacimiento)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <GrupoSwitch alumno={alumno} />
              </TableCell>
              <TableCell>
                {alumno.contacto_nombre && (
                  <div>
                    <div className="font-medium">{alumno.contacto_nombre}</div>
                    {alumno.contacto_tel && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {alumno.contacto_tel}
                      </div>
                    )}
                  </div>
                )}
                {!alumno.contacto_nombre && '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPromote(alumno)}
                    title="Promover alumno"
                  >
                    <GraduationCap className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(alumno)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(alumno)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
