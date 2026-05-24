// Shared template types.
// A template = a typed schema + a renderer. The agent fills the schema;
// the renderer turns it into output. Templates are the source of truth
// for structure — the AI never invents sections.

export type FieldType = 'text' | 'longtext' | 'list' | 'time' | 'duration';

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  helpText?: string;
  placeholder?: string;
}

export interface TemplateSection {
  key: string;
  title: string;
  description?: string;
  fields: TemplateField[];
  repeatable?: boolean;
  minItems?: number;
  maxItems?: number;
}

export interface TemplateParameter {
  key: string;
  label: string;
  type: 'enum';
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultValue: string;
}

export interface SubPlanTemplate {
  id: string;
  name: string;
  description: string;
  audienceNote: string;
  parameters?: TemplateParameter[];
  sections: TemplateSection[];
  defaults: Record<string, unknown>;
  render: (content: TemplateContent) => RenderedPlan;
}

export type TemplateContent = Record<string, unknown>;

export interface RenderedPlan {
  markdown: string;
  // Future: html, pdfBuffer, docxBuffer
}
