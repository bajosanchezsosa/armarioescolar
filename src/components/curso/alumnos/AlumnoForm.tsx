
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alumno, GrupoTaller } from '@/types/database';
import { useMateriasPendientes } from '@/hooks/useMateriasPendientes';

const alumnoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellido: z.string().min(1, 'El apellido es requerido'),
  dni: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  nacionalidad: z.string().optional(),
  direccion: z.string().optional(),
  contacto_nombre: z.string().optional(),
  contacto_tel: z.string().optional(),
  grupo_taller: z.enum(['A', 'B']),
});

type AlumnoFormData = z.infer<typeof alumnoSchema>;

interface AlumnoFormProps {
  alumno?: Alumno;
  cursoId: string;
  onSubmit: (data: AlumnoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  materiasPendientes?: any[];
}

export const AlumnoForm = ({ alumno, cursoId, onSubmit, onCancel, isLoading = false, materiasPendientes }: AlumnoFormProps) => {
  // Ensure grupo_taller is properly typed and has a default value
  const defaultGrupoTaller = (alumno?.grupo_taller === 'A' || alumno?.grupo_taller === 'B') 
    ? alumno.grupo_taller 
    : 'A';

  const form = useForm<AlumnoFormData>({
    resolver: zodResolver(alumnoSchema),
    defaultValues: {
      nombre: alumno?.nombre || '',
      apellido: alumno?.apellido || '',
      dni: alumno?.dni || '',
      fecha_nacimiento: alumno?.fecha_nacimiento || '',
      nacionalidad: alumno?.nacionalidad || '',
      direccion: alumno?.direccion || '',
      contacto_nombre: alumno?.contacto_nombre || '',
      contacto_tel: alumno?.contacto_tel || '',
      grupo_taller: defaultGrupoTaller,
    },
  });

  const handleSubmit = (data: AlumnoFormData) => {
    console.log('Form data being submitted:', data);
    
    // Clean up empty string values and convert them to null for optional fields
    const cleanedData = {
      ...data,
      dni: data.dni && data.dni.trim() !== '' ? data.dni.trim() : null,
      fecha_nacimiento: data.fecha_nacimiento && data.fecha_nacimiento.trim() !== '' ? data.fecha_nacimiento.trim() : null,
      nacionalidad: data.nacionalidad && data.nacionalidad.trim() !== '' ? data.nacionalidad.trim() : null,
      direccion: data.direccion && data.direccion.trim() !== '' ? data.direccion.trim() : null,
      contacto_nombre: data.contacto_nombre && data.contacto_nombre.trim() !== '' ? data.contacto_nombre.trim() : null,
      contacto_tel: data.contacto_tel && data.contacto_tel.trim() !== '' ? data.contacto_tel.trim() : null,
    };
    
    console.log('Cleaned form data:', cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del alumno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apellido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido *</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido del alumno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha_nacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nacionalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nacionalidad</FormLabel>
                <FormControl>
                  <Input placeholder="Argentina" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grupo_taller"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo de Taller *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="A">Grupo A</SelectItem>
                    <SelectItem value="B">Grupo B</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Dirección completa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contacto_nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="Padre/Madre/Tutor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contacto_tel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono de Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="11-1234-5678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {materiasPendientes && materiasPendientes.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Materias Pendientes</h3>
            <div className="space-y-2">
              {materiasPendientes.map((mp: any) => (
                <div key={mp.id} className="border p-2 rounded">
                  <p><strong>Materia:</strong> {mp.materia_original?.nombre} ({mp.anio_origen})</p>
                  <p><strong>Tipo:</strong> {mp.tipo_vinculacion}</p>
                  <p><strong>Estado:</strong> {mp.estado}</p>
                  {mp.observaciones && <p><strong>Obs:</strong> {mp.observaciones}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : (alumno ? 'Actualizar' : 'Crear')} Alumno
          </Button>
        </div>
      </form>
    </Form>
  );
};
