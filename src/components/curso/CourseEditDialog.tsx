
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Curso } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface CourseEditDialogProps {
  curso: Curso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TURNOS = ['mañana', 'tarde', 'vespertino'];
const ORIENTACIONES = [
  'ciclo básico',
  'multimedios', 
  'electromecánica',
  'energías renovables',
  'administración de las organizaciones'
];

export const CourseEditDialog = ({ curso, open, onOpenChange }: CourseEditDialogProps) => {
  const [formData, setFormData] = useState({
    anio: curso?.anio || 1,
    division: curso?.division || 1,
    turno: curso?.turno || 'mañana',
    orientacion: curso?.orientacion || 'ciclo básico'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curso) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cursos')
        .update({
          anio: formData.anio,
          division: formData.division,
          turno: formData.turno,
          orientacion: formData.orientacion
        })
        .eq('id', curso.id);

      if (error) throw error;

      toast({
        title: 'Curso actualizado',
        description: 'Los cambios se guardaron correctamente.',
      });

      queryClient.invalidateQueries({ queryKey: ['cursos'] });
      queryClient.invalidateQueries({ queryKey: ['curso', curso.id] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el curso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!curso) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año</Label>
              <Input
                id="anio"
                type="number"
                min="1"
                max="7"
                value={formData.anio}
                onChange={(e) => setFormData(prev => ({ ...prev, anio: parseInt(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="division">División</Label>
              <Input
                id="division"
                type="number"
                min="1"
                max="10"
                value={formData.division}
                onChange={(e) => setFormData(prev => ({ ...prev, division: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Turno</Label>
            <Select value={formData.turno} onValueChange={(value) => setFormData(prev => ({ ...prev, turno: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TURNOS.map((turno) => (
                  <SelectItem key={turno} value={turno}>
                    {turno.charAt(0).toUpperCase() + turno.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Orientación</Label>
            <Select value={formData.orientacion} onValueChange={(value) => setFormData(prev => ({ ...prev, orientacion: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORIENTACIONES.map((orientacion) => (
                  <SelectItem key={orientacion} value={orientacion}>
                    {orientacion.charAt(0).toUpperCase() + orientacion.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
