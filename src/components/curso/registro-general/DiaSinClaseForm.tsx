
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DiaSinClase } from '@/hooks/useDiasSinClase';

interface DiaSinClaseFormProps {
  diaSinClase?: DiaSinClase;
  fecha: string;
  onSubmit: (data: { motivo: string; descripcion?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const DiaSinClaseForm = ({ 
  diaSinClase, 
  fecha, 
  onSubmit, 
  onCancel, 
  isLoading 
}: DiaSinClaseFormProps) => {
  const [formData, setFormData] = useState({
    motivo: diaSinClase?.motivo || '',
    descripcion: diaSinClase?.descripcion || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.motivo.trim()) return;
    
    onSubmit({
      motivo: formData.motivo.trim(),
      descripcion: formData.descripcion.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" value={fecha} disabled className="bg-gray-50" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivo">Motivo *</Label>
        <Input
          id="motivo"
          value={formData.motivo}
          onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
          placeholder="Ej: Feriado, Paro, Actividad especial..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          placeholder="Detalles adicionales..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : diaSinClase ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
};
