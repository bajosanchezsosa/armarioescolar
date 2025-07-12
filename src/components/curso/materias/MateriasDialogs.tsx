
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MateriaForm } from './MateriaForm';
import { ModuloForm } from './ModuloForm';
import { Materia, MateriaModulo } from '@/types/database';

interface MateriasDialogsProps {
  // Materia dialog
  isMateriaDialogOpen: boolean;
  setIsMateriaDialogOpen: (open: boolean) => void;
  editingMateria: Materia | null;
  cursoId: string;
  onMateriaFormSubmit: (data: any) => void;
  isCreatingMateria: boolean;
  isUpdatingMateria: boolean;

  // Modulo dialog
  isModuloDialogOpen: boolean;
  setIsModuloDialogOpen: (open: boolean) => void;
  editingModulo: MateriaModulo | null;
  selectedMateriaId: string;
  onModuloFormSubmit: (data: any) => void;
  isCreatingModulo: boolean;
  isUpdatingModulo: boolean;

  // Delete dialogs
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  materiaToDelete: Materia | null;
  onConfirmDeleteMateria: () => void;
  isDeletingMateria: boolean;

  isDeleteModuloDialogOpen: boolean;
  setIsDeleteModuloDialogOpen: (open: boolean) => void;
  onConfirmDeleteModulo: () => void;
  isDeletingModulo: boolean;
}

export const MateriasDialogs = ({
  isMateriaDialogOpen,
  setIsMateriaDialogOpen,
  editingMateria,
  cursoId,
  onMateriaFormSubmit,
  isCreatingMateria,
  isUpdatingMateria,
  isModuloDialogOpen,
  setIsModuloDialogOpen,
  editingModulo,
  selectedMateriaId,
  onModuloFormSubmit,
  isCreatingModulo,
  isUpdatingModulo,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  materiaToDelete,
  onConfirmDeleteMateria,
  isDeletingMateria,
  isDeleteModuloDialogOpen,
  setIsDeleteModuloDialogOpen,
  onConfirmDeleteModulo,
  isDeletingModulo,
}: MateriasDialogsProps) => {
  return (
    <>
      {/* Dialog para crear/editar materia */}
      <Dialog open={isMateriaDialogOpen} onOpenChange={setIsMateriaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="materia-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingMateria ? 'Editar Materia' : 'Nueva Materia'}
            </DialogTitle>
            <div id="materia-dialog-description" className="text-sm text-gray-600">
              {editingMateria 
                ? 'Modifica los datos de la materia y sus módulos horarios.' 
                : 'Completa los datos para crear una nueva materia con sus módulos horarios.'
              }
            </div>
          </DialogHeader>
          <MateriaForm
            materia={editingMateria || undefined}
            cursoId={cursoId}
            onSubmit={onMateriaFormSubmit}
            onCancel={() => setIsMateriaDialogOpen(false)}
            isLoading={isCreatingMateria || isUpdatingMateria}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar módulo */}
      <Dialog open={isModuloDialogOpen} onOpenChange={setIsModuloDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingModulo ? 'Editar Módulo' : 'Nuevo Módulo'}
            </DialogTitle>
          </DialogHeader>
          <ModuloForm
            modulo={editingModulo || undefined}
            materiaId={selectedMateriaId}
            onSubmit={onModuloFormSubmit}
            onCancel={() => setIsModuloDialogOpen(false)}
            isLoading={isCreatingModulo || isUpdatingModulo}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación de materia */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              ¿Estás seguro de que deseas eliminar la materia{' '}
              <span className="font-semibold">
                {materiaToDelete?.nombre}
              </span>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              Esta acción también eliminará todos los módulos horarios asociados y no se puede deshacer.
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
              onClick={onConfirmDeleteMateria}
              disabled={isDeletingMateria}
            >
              {isDeletingMateria ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar eliminación de módulo */}
      <Dialog open={isDeleteModuloDialogOpen} onOpenChange={setIsDeleteModuloDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              ¿Estás seguro de que deseas eliminar este módulo horario?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModuloDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDeleteModulo}
              disabled={isDeletingModulo}
            >
              {isDeletingModulo ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
