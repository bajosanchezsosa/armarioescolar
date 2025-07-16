// Días hábiles específicos para 2025
// Julio 2025: empieza martes 1, termina jueves 31
// Solo lunes a viernes

export const DIAS_HABILES_JULIO_2025 = [
  '2025-07-01', // Martes 1
  '2025-07-02', // Miércoles 2
  '2025-07-03', // Jueves 3
  '2025-07-04', // Viernes 4
  '2025-07-07', // Lunes 7
  '2025-07-08', // Martes 8
  '2025-07-09', // Miércoles 9
  '2025-07-10', // Jueves 10
  '2025-07-11', // Viernes 11
  '2025-07-14', // Lunes 14
  '2025-07-15', // Martes 15
  '2025-07-16', // Miércoles 16
  '2025-07-17', // Jueves 17
  '2025-07-18', // Viernes 18
  '2025-07-21', // Lunes 21
  '2025-07-22', // Martes 22
  '2025-07-23', // Miércoles 23
  '2025-07-24', // Jueves 24
  '2025-07-25', // Viernes 25
  '2025-07-28', // Lunes 28
  '2025-07-29', // Martes 29
  '2025-07-30', // Miércoles 30
  '2025-07-31'  // Jueves 31
];

export function getDiasHabilesJulio2025(): string[] {
  console.log('=== USANDO DÍAS HÁBILES JULIO 2025 ===');
  console.log('Total días:', DIAS_HABILES_JULIO_2025.length);
  console.log('Primer día:', DIAS_HABILES_JULIO_2025[0]);
  console.log('Último día:', DIAS_HABILES_JULIO_2025[DIAS_HABILES_JULIO_2025.length - 1]);
  
  // Verificar que no hay domingos
  const domingos = DIAS_HABILES_JULIO_2025.filter(fecha => {
    const diaSemana = new Date(fecha).getDay();
    return diaSemana === 0;
  });
  console.log('Domingos encontrados:', domingos);
  
  // Verificar que no hay sábados
  const sabados = DIAS_HABILES_JULIO_2025.filter(fecha => {
    const diaSemana = new Date(fecha).getDay();
    return diaSemana === 6;
  });
  console.log('Sábados encontrados:', sabados);
  
  return DIAS_HABILES_JULIO_2025;
} 