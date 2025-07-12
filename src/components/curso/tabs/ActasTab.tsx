
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ClipboardList, Search, Filter } from 'lucide-react';
import { useActas } from '@/hooks/useActas';
import { ActaForm } from '../actas/ActaForm';
import { ActasList } from '../actas/ActasList';
import { ActaConAlumnos, TipoActa } from '@/types/database';
import { Loader2, AlertCircle } from 'lucide-react';

interface ActasTabProps {
  cursoId: string;
}

export const ActasTab = ({ cursoId }: ActasTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActa, setEditingActa] = useState<ActaConAlumnos | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todas');

  const { data: actas = [], isLoading, error } = useActas(cursoId);

  const filteredActas = actas.filter(acta => {
    const matchesSearch = acta.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         acta.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todas' || acta.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const handleEdit = (acta: ActaConAlumnos) => {
    setEditingActa(acta);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingActa(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando actas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>Error al cargar las actas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registro de Actas</h2>
          <p className="text-gray-600">Documentación de acontecimientos importantes del curso</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Acta
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por título o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las actas</SelectItem>
                <SelectItem value="curso">Todo el curso</SelectItem>
                <SelectItem value="alumno">Alumno específico</SelectItem>
                <SelectItem value="disciplinario">Disciplinario</SelectItem>
                <SelectItem value="salud">Salud</SelectItem>
                <SelectItem value="accidente">Accidente</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de actas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Actas Registradas ({filteredActas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActasList actas={filteredActas} onEdit={handleEdit} />
        </CardContent>
      </Card>

      {/* Formulario de acta */}
      <ActaForm
        cursoId={cursoId}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        acta={editingActa}
      />
    </div>
  );
};
