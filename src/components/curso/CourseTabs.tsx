
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, BookOpen, Calendar, FileText, ClipboardList, Grid3X3 } from 'lucide-react';
import { AlumnosTab } from './tabs/AlumnosTab';
import { MateriasTab } from './tabs/MateriasTab';
import { AsistenciaTab } from './tabs/AsistenciaTab';
import { NotasTab } from './tabs/NotasTab';
import { ActasTab } from './tabs/ActasTab';
import { RegistroGeneralTab } from './tabs/RegistroGeneralTab';

interface CourseTabsProps {
  cursoId: string;
}

export const CourseTabs = ({ cursoId }: CourseTabsProps) => {
  return (
    <Tabs defaultValue="alumnos" className="w-full">
      <TabsList className="grid w-full grid-cols-6 h-14 bg-white border border-gray-200 rounded-lg p-2">
        <TabsTrigger 
          value="alumnos" 
          className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Alumnos</span>
        </TabsTrigger>
        <TabsTrigger 
          value="materias" 
          className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Materias</span>
        </TabsTrigger>
        <TabsTrigger 
          value="asistencia" 
          className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Asistencia Diaria</span>
        </TabsTrigger>
        <TabsTrigger 
          value="registro-general" 
          className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
        >
          <Grid3X3 className="h-4 w-4" />
          <span className="hidden sm:inline">Registro General</span>
        </TabsTrigger>
        <TabsTrigger 
          value="notas" 
          className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Notas</span>
        </TabsTrigger>
        <TabsTrigger 
          value="actas" 
          className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
        >
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Actas</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="alumnos" className="space-y-6">
          <AlumnosTab cursoId={cursoId} />
        </TabsContent>

        <TabsContent value="materias" className="space-y-6">
          <MateriasTab cursoId={cursoId} />
        </TabsContent>

        <TabsContent value="asistencia" className="space-y-6">
          <AsistenciaTab cursoId={cursoId} />
        </TabsContent>

        <TabsContent value="registro-general" className="space-y-6">
          <RegistroGeneralTab cursoId={cursoId} />
        </TabsContent>

        <TabsContent value="notas" className="space-y-6">
          <NotasTab cursoId={cursoId} />
        </TabsContent>

        <TabsContent value="actas" className="space-y-6">
          <ActasTab cursoId={cursoId} />
        </TabsContent>
      </div>
    </Tabs>
  );
};
