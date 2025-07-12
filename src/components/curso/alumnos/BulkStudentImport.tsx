
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useCreateAlumno } from '@/hooks/useAlumnos';
import { useToast } from '@/hooks/use-toast';

interface BulkStudentImportProps {
  cursoId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedStudent {
  nombre: string;
  apellido: string;
  valid: boolean;
  error?: string;
}

export const BulkStudentImport = ({ cursoId, isOpen, onClose }: BulkStudentImportProps) => {
  const [textInput, setTextInput] = useState('');
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const createAlumno = useCreateAlumno();
  const { toast } = useToast();

  const parseStudentData = (text: string): ParsedStudent[] => {
    if (!text.trim()) return [];

    const lines = text.trim().split('\n');
    const students: ParsedStudent[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Try different separators: tab, comma, multiple spaces
      let parts = trimmedLine.split('\t');
      if (parts.length === 1) {
        parts = trimmedLine.split(',');
      }
      if (parts.length === 1) {
        parts = trimmedLine.split(/\s{2,}/); // Multiple spaces
      }
      if (parts.length === 1) {
        parts = trimmedLine.split(' '); // Single space (assume first word is name, rest is surname)
        if (parts.length >= 2) {
          const nombre = parts[0];
          const apellido = parts.slice(1).join(' ');
          parts = [nombre, apellido];
        }
      }

      if (parts.length >= 2) {
        const nombre = parts[0].trim();
        const apellido = parts[1].trim();
        
        if (nombre && apellido) {
          students.push({
            nombre,
            apellido,
            valid: true
          });
        } else {
          students.push({
            nombre: nombre || '',
            apellido: apellido || '',
            valid: false,
            error: 'Nombre o apellido vacío'
          });
        }
      } else {
        students.push({
          nombre: trimmedLine,
          apellido: '',
          valid: false,
          error: 'Formato inválido - debe contener nombre y apellido'
        });
      }
    });

    return students;
  };

  const handleTextChange = (value: string) => {
    setTextInput(value);
    const parsed = parseStudentData(value);
    setParsedStudents(parsed);
  };

  const handleImport = async () => {
    const validStudents = parsedStudents.filter(student => student.valid);
    
    if (validStudents.length === 0) {
      toast({
        title: "Error",
        description: "No hay estudiantes válidos para importar",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const student of validStudents) {
      try {
        await new Promise<void>((resolve, reject) => {
          createAlumno.mutate(
            {
              nombre: student.nombre,
              apellido: student.apellido,
              curso_id: cursoId,
              grupo_taller: 'A', // Default group
              activo: true,
            },
            {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (error) => {
                errorCount++;
                console.error(`Error creating student ${student.nombre} ${student.apellido}:`, error);
                reject(error);
              },
            }
          );
        });
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        // Error already counted above
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      toast({
        title: "Importación completada",
        description: `${successCount} estudiantes agregados exitosamente${errorCount > 0 ? `. ${errorCount} errores.` : '.'}`,
      });
    }

    if (errorCount === validStudents.length) {
      toast({
        title: "Error en la importación",
        description: "No se pudo agregar ningún estudiante",
        variant: "destructive",
      });
    }

    // Close dialog and reset
    onClose();
    setTextInput('');
    setParsedStudents([]);
  };

  const validCount = parsedStudents.filter(s => s.valid).length;
  const invalidCount = parsedStudents.filter(s => !s.valid).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Carga Masiva de Alumnos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Copia los datos desde Excel y pégalos en el área de texto</p>
              <p>• Formato esperado: <code>Nombre</code> + <code>Apellido</code> (separados por tab, coma o espacios)</p>
              <p>• Ejemplo: <code>Juan García</code> o <code>María,López</code></p>
              <p>• Los alumnos se crearán con datos básicos. Podrás completar el resto después.</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Datos de alumnos (copiar desde Excel)
              </label>
              <Textarea
                placeholder="Pega aquí los datos de los alumnos..."
                value={textInput}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            {parsedStudents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Vista Previa ({parsedStudents.length} registros)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-4">
                    {validCount > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{validCount} válidos</span>
                      </div>
                    )}
                    {invalidCount > 0 && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{invalidCount} con errores</span>
                      </div>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-b font-medium text-sm">
                      <div>Nombre</div>
                      <div>Apellido</div>
                      <div>Estado</div>
                    </div>
                    {parsedStudents.map((student, index) => (
                      <div
                        key={index}
                        className={`grid grid-cols-3 gap-2 p-3 border-b text-sm ${
                          student.valid ? 'bg-white' : 'bg-red-50'
                        }`}
                      >
                        <div className="font-medium">{student.nombre}</div>
                        <div>{student.apellido}</div>
                        <div className="flex items-center gap-2">
                          {student.valid ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Válido
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {student.error}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleImport}
              disabled={validCount === 0 || isProcessing}
            >
              {isProcessing ? 'Importando...' : `Importar ${validCount} Alumnos`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
