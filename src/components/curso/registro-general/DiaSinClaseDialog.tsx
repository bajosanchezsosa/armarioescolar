
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { DiaSinClase, useDiasSinClaseMutations } from '@/hooks/useDiasSinClase';
import { DiaSinClaseForm } from './DiaSinClaseForm';
import { useState } from 'react';

interface DiaSinClaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: Date | null;
  cursoId: string;
  diaSinClase?: DiaSinClase;
}

export const DiaSinClaseDialog = ({ 
  open, 
  onOpenChange, 
  day, 
  cursoId,
  diaSinClase 
}: DiaSinClaseDialogProps) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const { createDiaSinClase, updateDiaSinClase, deleteDiaSinClase } = useDiasSinClaseMutations(cursoId);

  if (!day) return null;

  const fecha = format(day, 'yyyy-MM-dd');
  const fechaDisplay = format(day, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  const handleSubmit = async (data: { motivo: string; descripcion?: string }) => {
    try {
      if (diaSinClase) {
        await updateDiaSinClase.mutateAsync({
          id: diaSinClase.id,
          ...data
        });
      } else {
        await createDiaSinClase.mutateAsync({
          fecha,
          curso_id: cursoId,
          ...data
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving dia sin clase:', error);
    }
  };

  const handleDelete = async () => {
    if (!diaSinClase) return;
    
    try {
      await deleteDiaSinClase.mutateAsync(diaSinClase.id);
      setShowDeleteAlert(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting dia sin clase:', error);
    }
  };

  const isLoading = createDiaSinClase.isPending || updateDiaSinClase.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {diaSinClase ? 'Modificar día sin clase' : 'Marcar día sin clase'}
            </DialogTitle>
            {diaSinClase && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteAlert(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </DialogHeader>

          <div className="mb-4">
            <p className="text-sm text-gray-600 capitalize">
              {fechaDisplay}
            </p>
          </div>

          <DiaSinClaseForm
            diaSinClase={diaSinClase}
            fecha={fecha}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar día sin clase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la marca de "día sin clase" para el {fechaDisplay}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteDiaSinClase.isPending}
            >
              {deleteDiaSinClase.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
