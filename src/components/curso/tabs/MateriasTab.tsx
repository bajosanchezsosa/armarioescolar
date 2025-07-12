
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { useMaterias } from '@/hooks/useMateriaQueries';
import { useMateriaCreate } from '@/hooks/useMateriaCreate';
import { useMateriaUpdate } from '@/hooks/useMateriaUpdate';
import { useMateriaDelete } from '@/hooks/useMateriaDelete';
import { MateriasTable } from '../materias/MateriasTable';
import { HorarioGrid } from '../materias/HorarioGrid';
import { MateriasTabHeader } from '../materias/MateriasTabHeader';
import { MateriasDialogs } from '../materias/MateriasDialogs';
import { MateriasLoadingState } from '../materias/MateriasLoadingState';
import { Materia, MateriaModulo } from '@/types/database';

interface MateriasTabProps {
  cursoId: string;
}

export const MateriasTab = ({ cursoId }: MateriasTabProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMateriaDialogOpen, setIsMateriaDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMateria, setEditingMateria] = useState<Materia | null>(null);
  const [materiaToDelete, setMateriaToDelete] = useState<Materia | null>(null);

  const { data: materias, isLoading, error } = useMaterias(cursoId);
  const createMateria = useMateriaCreate(cursoId);
  const updateMateria = useMateriaUpdate(cursoId);
  const deleteMateria = useMateriaDelete(cursoId);

  const handleCreateMateria = () => {
    setEditingMateria(null);
    setIsMateriaDialogOpen(true);
  };

  const handleEditMateria = (materia: Materia) => {
    setEditingMateria(materia);
    setIsMateriaDialogOpen(true);
  };

  const handleDeleteMateria = (materia: Materia) => {
    setMateriaToDelete(materia);
    setIsDeleteDialogOpen(true);
  };

  const handleMateriaFormSubmit = (data: any) => {
    console.log('Form data received:', data);
    
    if (editingMateria) {
      updateMateria.mutate(
        { id: editingMateria.id, ...data },
        {
          onSuccess: () => {
            setIsMateriaDialogOpen(false);
            setEditingMateria(null);
          },
          onError: (error) => {
            console.error('Error updating materia:', error);
          }
        }
      );
    } else {
      createMateria.mutate(
        { ...data },
        {
          onSuccess: () => {
            setIsMateriaDialogOpen(false);
          },
          onError: (error) => {
            console.error('Error creating materia:', error);
          }
        }
      );
    }
  };

  const handleConfirmDeleteMateria = () => {
    if (materiaToDelete) {
      deleteMateria.mutate(materiaToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setMateriaToDelete(null);
        },
      });
    }
  };

  // Funciones dummy para los módulos (ya no las usamos)
  const handleAddModulo = () => {};
  const handleEditModulo = () => {};
  const handleDeleteModulo = () => {};

  // Si hay error en las queries, mostrarlo
  if (error) {
    console.error('Error loading materias:', error);
  }

  return (
    <div className="space-y-6">
      <MateriasLoadingState isLoading={isLoading} error={error} />
      
      {!isLoading && !error && (
        <>
          <MateriasTabHeader
            materiasCount={materias?.length || 0}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateMateria={handleCreateMateria}
          />

          {viewMode === 'grid' ? (
            <HorarioGrid materias={materias || []} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lista de Materias y Módulos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MateriasTable
                  materias={materias || []}
                  onEditMateria={handleEditMateria}
                  onDeleteMateria={handleDeleteMateria}
                  onAddModulo={handleAddModulo}
                  onEditModulo={handleEditModulo}
                  onDeleteModulo={handleDeleteModulo}
                />
              </CardContent>
            </Card>
          )}

          <MateriasDialogs
            isMateriaDialogOpen={isMateriaDialogOpen}
            setIsMateriaDialogOpen={setIsMateriaDialogOpen}
            editingMateria={editingMateria}
            cursoId={cursoId}
            onMateriaFormSubmit={handleMateriaFormSubmit}
            isCreatingMateria={createMateria.isPending}
            isUpdatingMateria={updateMateria.isPending}
            isModuloDialogOpen={false}
            setIsModuloDialogOpen={() => {}}
            editingModulo={null}
            selectedMateriaId=""
            onModuloFormSubmit={() => {}}
            isCreatingModulo={false}
            isUpdatingModulo={false}
            isDeleteDialogOpen={isDeleteDialogOpen}
            setIsDeleteDialogOpen={setIsDeleteDialogOpen}
            materiaToDelete={materiaToDelete}
            onConfirmDeleteMateria={handleConfirmDeleteMateria}
            isDeletingMateria={deleteMateria.isPending}
            isDeleteModuloDialogOpen={false}
            setIsDeleteModuloDialogOpen={() => {}}
            onConfirmDeleteModulo={() => {}}
            isDeletingModulo={false}
          />
        </>
      )}
    </div>
  );
};
