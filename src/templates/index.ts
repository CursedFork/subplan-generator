import { standardDayTemplate } from './standardDay';
import { singlePeriodTemplate } from './singlePeriod';
import { emergencyTemplate } from './emergency';
import { halfDayTemplate } from './halfDay';
import type { SubPlanTemplate } from './types';

export const templates: Record<string, SubPlanTemplate> = {
  'standard-day': standardDayTemplate,
  'single-period': singlePeriodTemplate,
  'emergency': emergencyTemplate,
  'half-day': halfDayTemplate,
};

export const defaultTemplateId = 'standard-day';

export type { SubPlanTemplate, TemplateContent, TemplateSection, TemplateField } from './types';
