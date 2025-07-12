export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      acta_alumnos: {
        Row: {
          acta_id: string
          alumno_id: string
          id: string
        }
        Insert: {
          acta_id: string
          alumno_id: string
          id?: string
        }
        Update: {
          acta_id?: string
          alumno_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acta_alumnos_acta_id_fkey"
            columns: ["acta_id"]
            isOneToOne: false
            referencedRelation: "actas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acta_alumnos_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
        ]
      }
      actas: {
        Row: {
          actualizado_en: string
          creado_en: string
          curso_id: string
          descripcion: string
          fecha: string
          id: string
          prioridad: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          curso_id: string
          descripcion: string
          fecha: string
          id?: string
          prioridad?: string
          tipo?: string
          titulo: string
          user_id: string
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          curso_id?: string
          descripcion?: string
          fecha?: string
          id?: string
          prioridad?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alumnos: {
        Row: {
          activo: boolean
          apellido: string
          contacto_nombre: string | null
          contacto_tel: string | null
          creado_en: string
          curso_id: string
          direccion: string | null
          dni: string | null
          fecha_nacimiento: string | null
          grupo_taller: string
          id: string
          nacionalidad: string | null
          nombre: string
        }
        Insert: {
          activo?: boolean
          apellido: string
          contacto_nombre?: string | null
          contacto_tel?: string | null
          creado_en?: string
          curso_id: string
          direccion?: string | null
          dni?: string | null
          fecha_nacimiento?: string | null
          grupo_taller: string
          id?: string
          nacionalidad?: string | null
          nombre: string
        }
        Update: {
          activo?: boolean
          apellido?: string
          contacto_nombre?: string | null
          contacto_tel?: string | null
          creado_en?: string
          curso_id?: string
          direccion?: string | null
          dni?: string | null
          fecha_nacimiento?: string | null
          grupo_taller?: string
          id?: string
          nacionalidad?: string | null
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumnos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      asistencias: {
        Row: {
          alumno_id: string
          creado_en: string
          estado: string
          fecha: string
          id: string
          materia_id: string
          user_id: string
        }
        Insert: {
          alumno_id: string
          creado_en?: string
          estado?: string
          fecha: string
          id?: string
          materia_id: string
          user_id: string
        }
        Update: {
          alumno_id?: string
          creado_en?: string
          estado?: string
          fecha?: string
          id?: string
          materia_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencias_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencias_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asistencias_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      asistencias_log: {
        Row: {
          created_at: string
          curso_id: string
          fecha: string
          id: string
          materia_id: string
          user_id: string
          user_nombre: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          fecha: string
          id?: string
          materia_id: string
          user_id: string
          user_nombre: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          fecha?: string
          id?: string
          materia_id?: string
          user_id?: string
          user_nombre?: string
        }
        Relationships: []
      }
      calificaciones_finales: {
        Row: {
          actualizado_en: string | null
          alumno_id: string | null
          anio_lectivo: number
          calificacion_definitiva: string | null
          creado_en: string | null
          creado_por_id: string | null
          cuatrimestre_1: string | null
          cuatrimestre_2: string | null
          curso_id: string | null
          diciembre: string | null
          estado: string
          id: string
          marzo: string | null
          materia_id: string | null
          observaciones: string | null
          promedio_anual: string | null
        }
        Insert: {
          actualizado_en?: string | null
          alumno_id?: string | null
          anio_lectivo: number
          calificacion_definitiva?: string | null
          creado_en?: string | null
          creado_por_id?: string | null
          cuatrimestre_1?: string | null
          cuatrimestre_2?: string | null
          curso_id?: string | null
          diciembre?: string | null
          estado?: string
          id?: string
          marzo?: string | null
          materia_id?: string | null
          observaciones?: string | null
          promedio_anual?: string | null
        }
        Update: {
          actualizado_en?: string | null
          alumno_id?: string | null
          anio_lectivo?: number
          calificacion_definitiva?: string | null
          creado_en?: string | null
          creado_por_id?: string | null
          cuatrimestre_1?: string | null
          cuatrimestre_2?: string | null
          curso_id?: string | null
          diciembre?: string | null
          estado?: string
          id?: string
          marzo?: string | null
          materia_id?: string | null
          observaciones?: string | null
          promedio_anual?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_finales_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_finales_creado_por_id_fkey"
            columns: ["creado_por_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_finales_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calificaciones_finales_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          activo: boolean
          anio: number
          division: number
          id: string
          orientacion: string
          turno: string
        }
        Insert: {
          activo?: boolean
          anio: number
          division: number
          id?: string
          orientacion?: string
          turno: string
        }
        Update: {
          activo?: boolean
          anio?: number
          division?: number
          id?: string
          orientacion?: string
          turno?: string
        }
        Relationships: []
      }
      dias_sin_clase: {
        Row: {
          created_at: string
          curso_id: string
          descripcion: string | null
          fecha: string
          id: string
          motivo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          descripcion?: string | null
          fecha: string
          id?: string
          motivo: string
          user_id: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          motivo?: string
          user_id?: string
        }
        Relationships: []
      }
      materia_modulos: {
        Row: {
          cantidad_modulos: number
          dia_semana: number
          grupo: string
          hora_inicio: string
          id: string
          materia_id: string
        }
        Insert: {
          cantidad_modulos: number
          dia_semana: number
          grupo: string
          hora_inicio: string
          id?: string
          materia_id: string
        }
        Update: {
          cantidad_modulos?: number
          dia_semana?: number
          grupo?: string
          hora_inicio?: string
          id?: string
          materia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materia_modulos_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      materias: {
        Row: {
          creado_en: string
          curso_id: string
          id: string
          nombre: string
          profesor: string | null
          tipo: string
        }
        Insert: {
          creado_en?: string
          curso_id: string
          id?: string
          nombre: string
          profesor?: string | null
          tipo: string
        }
        Update: {
          creado_en?: string
          curso_id?: string
          id?: string
          nombre?: string
          profesor?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      materias_pendientes: {
        Row: {
          actualizado_en: string | null
          alumno_id: string | null
          anio_origen: number
          creado_en: string | null
          creado_por_id: string | null
          estado: string | null
          id: string
          materia_original_id: string | null
          observaciones: string | null
          vinculada_con_materia_id: string | null
        }
        Insert: {
          actualizado_en?: string | null
          alumno_id?: string | null
          anio_origen: number
          creado_en?: string | null
          creado_por_id?: string | null
          estado?: string | null
          id?: string
          materia_original_id?: string | null
          observaciones?: string | null
          vinculada_con_materia_id?: string | null
        }
        Update: {
          actualizado_en?: string | null
          alumno_id?: string | null
          anio_origen?: number
          creado_en?: string | null
          creado_por_id?: string | null
          estado?: string | null
          id?: string
          materia_original_id?: string | null
          observaciones?: string | null
          vinculada_con_materia_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materias_pendientes_alumno_id_fkey"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materias_pendientes_creado_por_id_fkey"
            columns: ["creado_por_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materias_pendientes_materia_original_id_fkey"
            columns: ["materia_original_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materias_pendientes_vinculada_con_materia_id_fkey"
            columns: ["vinculada_con_materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          alumno_id: string
          created_at: string
          curso_id: string
          fecha: string
          id: string
          materia_id: string
          nota: string | null
          observaciones: string | null
          periodo_id: string | null
          tipo_evaluacion: string
          updated_at: string
        }
        Insert: {
          alumno_id: string
          created_at?: string
          curso_id: string
          fecha: string
          id?: string
          materia_id: string
          nota?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          tipo_evaluacion: string
          updated_at?: string
        }
        Update: {
          alumno_id?: string
          created_at?: string
          curso_id?: string
          fecha?: string
          id?: string
          materia_id?: string
          nota?: string | null
          observaciones?: string | null
          periodo_id?: string | null
          tipo_evaluacion?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notas_alumno"
            columns: ["alumno_id"]
            isOneToOne: false
            referencedRelation: "alumnos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notas_curso"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notas_materia"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      periodos_notas: {
        Row: {
          activo: boolean
          created_at: string
          curso_id: string
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          curso_id: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          curso_id?: string
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodos_notas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      planillas_compartibles: {
        Row: {
          created_at: string
          curso_id: string
          estado: string
          fecha_completada: string | null
          id: string
          materia_id: string
          periodo_id: string
          profesor_nombre: string | null
          token_url: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          estado?: string
          fecha_completada?: string | null
          id?: string
          materia_id: string
          periodo_id: string
          profesor_nombre?: string | null
          token_url: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          estado?: string
          fecha_completada?: string | null
          id?: string
          materia_id?: string
          periodo_id?: string
          profesor_nombre?: string | null
          token_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "planillas_compartibles_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planillas_compartibles_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planillas_compartibles_periodo_id_fkey"
            columns: ["periodo_id"]
            isOneToOne: false
            referencedRelation: "periodos_notas"
            referencedColumns: ["id"]
          },
        ]
      }
      planillas_notas: {
        Row: {
          cuatrimestre: number
          curso_id: string
          fecha_creacion: string
          generado_por_id: string
          id: string
          token_url: string
        }
        Insert: {
          cuatrimestre: number
          curso_id: string
          fecha_creacion?: string
          generado_por_id: string
          id?: string
          token_url: string
        }
        Update: {
          cuatrimestre?: number
          curso_id?: string
          fecha_creacion?: string
          generado_por_id?: string
          id?: string
          token_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "planillas_notas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planillas_notas_generado_por_id_fkey"
            columns: ["generado_por_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promociones_log: {
        Row: {
          alumno_id: string
          created_at: string
          curso_destino_id: string
          curso_origen_id: string
          fecha_promocion: string
          id: string
          observaciones: string | null
          user_id: string
        }
        Insert: {
          alumno_id: string
          created_at?: string
          curso_destino_id: string
          curso_origen_id: string
          fecha_promocion?: string
          id?: string
          observaciones?: string | null
          user_id: string
        }
        Update: {
          alumno_id?: string
          created_at?: string
          curso_destino_id?: string
          curso_origen_id?: string
          fecha_promocion?: string
          id?: string
          observaciones?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          creado_en: string
          email: string
          id: string
          iniciales: string
          nombre: string
        }
        Insert: {
          creado_en?: string
          email: string
          id?: string
          iniciales: string
          nombre: string
        }
        Update: {
          creado_en?: string
          email?: string
          id?: string
          iniciales?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
