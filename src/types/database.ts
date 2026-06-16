// Hand-written stub — overwritten when you run `npm run db:types` against a
// linked Supabase project. Keep in sync with migrations until then.
//
// To generate real types:
//   1. supabase login
//   2. supabase link --project-ref <ref>
//   3. npm run db:types

export type Database = {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          grade: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          grade?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          grade?: string | null;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          attributes: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          name: string;
          attributes?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          name?: string;
          attributes?: Record<string, unknown>;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
