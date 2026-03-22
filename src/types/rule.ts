export interface RuleDto {
  ruleId: string;
  condition: string;
  value: string;
  scoreImpact: number;
  description?: string;
  isActive: boolean;
}

export interface UpsertRuleDto {
  ruleId?: string;
  condition: string;
  value: string;
  scoreImpact: number;
  description?: string;
  isActive: boolean;
}
