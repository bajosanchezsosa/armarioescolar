
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Materia } from '@/types/database';
import { MateriaBasicInfoForm } from './MateriaBasicInfoForm';
import { ModuloFormSection } from './ModuloFormSection';
import { useMateriaFormLogic, MateriaFormData } from './useMateriaFormLogic';

interface MateriaFormProps {
  materia?: Materia;
  cursoId: string;
  onSubmit: (data: MateriaFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MateriaForm = ({ materia, cursoId, onSubmit, onCancel, isLoading = false }: MateriaFormProps) => {
  const {
    form,
    fields,
    append,
    remove,
    loadingModulos,
    handleTipoChange,
    handleFormSubmit,
  } = useMateriaFormLogic({ materia, onSubmit });

  const tipoValue = form.watch('tipo');

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {materia ? 'Editar Materia' : 'Nueva Materia'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loadingModulos && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">Cargando módulos existentes...</p>
          </div>
        )}
        
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <MateriaBasicInfoForm
            register={form.register}
            setValue={form.setValue}
            tipoValue={tipoValue}
            onTipoChange={handleTipoChange}
            errors={form.formState.errors}
            profesorValue={form.watch('profesor')}
          />

          <ModuloFormSection
            fields={fields}
            register={form.register}
            setValue={form.setValue}
            watch={form.watch}
            append={append}
            remove={remove}
            tipoValue={tipoValue}
            errors={form.formState.errors}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : materia ? 'Actualizar' : 'Crear Materia'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
