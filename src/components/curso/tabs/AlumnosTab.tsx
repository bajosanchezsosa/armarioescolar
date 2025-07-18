
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Users, Loader2, AlertCircle, Upload, GraduationCap, UsersIcon } from 'lucide-react';
import { useAlumnos, useCreateAlumno, useUpdateAlumno, useDeleteAlumno } from '@/hooks/useAlumnos';
import { useCurso } from '@/hooks/useCurso';
import { useMateriasPendientes } from '@/hooks/useMateriasPendientes';
import { AlumnosTable } from '../alumnos/AlumnosTable';
import { AlumnoForm } from '../alumnos/AlumnoForm';
import { BulkStudentImport } from '../alumnos/BulkStudentImport';
import { PromocionAlumno } from '../alumnos/PromocionAlumno';
import { PromocionMasiva } from '../alumnos/PromocionMasiva';
import { Alumno } from '@/types/database';

interface AlumnosTabProps {
  cursoId: string;
}

export const AlumnosTab = ({ cursoId }: AlumnosTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isPromocionOpen, setIsPromocionOpen] = useState(false);
  const [isPromocionMasivaOpen, setIsPromocionMasivaOpen] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState<Alumno | null>(null);
  const [promotingAlumno, setPromotingAlumno] = useState<Alumno | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [alumnoToDelete, setAlumnoToDelete] = useState<Alumno | null>(null);

  const { data: alumnos, isLoading, error } = useAlumnos(cursoId);
  const { data: curso } = useCurso(cursoId);
  const { data: materiasPendientes } = useMateriasPendientes(undefined, editingAlumno?.id);
  const createAlumno = useCreateAlumno();
  const updateAlumno = useUpdateAlumno();
  const deleteAlumno = useDeleteAlumno();

  const handleCreateAlumno = () => {
    setEditingAlumno(null);
    setIsDialogOpen(true);
  };

  const handleBulkImport = () => {
    setIsBulkImportOpen(true);
  };

  const handlePromocionMasiva = () => {
    setIsPromocionMasivaOpen(true);
  };

  const handleEditAlumno = (alumno: Alumno) => {
    setEditingAlumno(alumno);
    setIsDialogOpen(true);
  };

  const handlePromoteAlumno = (alumno: Alumno) => {
    setPromotingAlumno(alumno);
    setIsPromocionOpen(true);
  };

  const handleDeleteAlumno = (alumno: Alumno) => {
    setAlumnoToDelete(alumno);
    setIsDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingAlumno) {
      updateAlumno.mutate(
        { id: editingAlumno.id, updates: data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingAlumno(null);
          },
        }
      );
    } else {
      createAlumno.mutate(
        { ...data, curso_id: cursoId },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  const handleConfirmDelete = () => {
    if (alumnoToDelete) {
      deleteAlumno.mutate(alumnoToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setAlumnoToDelete(null);
        },
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAlumno(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando alumnos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>Error al cargar los alumnos</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Alumnos</h2>
          <p className="text-gray-600">
            Administra los estudiantes del curso ({alumnos?.length || 0} alumnos registrados)
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleBulkImport} 
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Carga Masiva
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePromocionMasiva}
            className="flex items-center gap-2"
            disabled={!alumnos || alumnos.length === 0}
          >
            <UsersIcon className="h-4 w-4" />
            Promoción Masiva
          </Button>
          <Button onClick={handleCreateAlumno} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar Alumno
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Alumnos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlumnosTable
            alumnos={alumnos || []}
            onEdit={handleEditAlumno}
            onDelete={handleDeleteAlumno}
            onPromote={handlePromoteAlumno}
          />
        </CardContent>
      </Card>

      {/* Dialog para crear/editar alumno */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlumno ? 'Editar Alumno' : 'Agregar Nuevo Alumno'}
            </DialogTitle>
          </DialogHeader>
          <AlumnoForm
            alumno={editingAlumno || undefined}
            cursoId={cursoId}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseDialog}
            isLoading={createAlumno.isPending || updateAlumno.isPending}
            materiasPendientes={materiasPendientes}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para promoción individual */}
      {promotingAlumno && curso && (
        <PromocionAlumno
          alumno={promotingAlumno}
          cursoActual={curso}
          isOpen={isPromocionOpen}
          onClose={() => {
            setIsPromocionOpen(false);
            setPromotingAlumno(null);
          }}
        />
      )}

      {/* Dialog para promoción masiva */}
      {curso && (
        <PromocionMasiva
          alumnos={alumnos || []}
          cursoActual={curso}
          isOpen={isPromocionMasivaOpen}
          onClose={() => setIsPromocionMasivaOpen(false)}
        />
      )}

      {/* Dialog para carga masiva */}
      <BulkStudentImport
        cursoId={cursoId}
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
      />

      {/* Dialog para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold">
                {alumnoToDelete?.nombre} {alumnoToDelete?.apellido}
              </span>{' '}
              del curso?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer. El alumno será marcado como inactivo.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteAlumno.isPending}
            >
              {deleteAlumno.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
