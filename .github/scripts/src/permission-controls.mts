#!/usr/bin/env node
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const STATUS_VALUES = ['implemented', 'partial', 'not_implemented', 'accepted_risk', 'external_dependency'] as const;
const REPORT_VALUES = ['sdlc_permission_lifecycle', 'security_permission_design'] as const;
const DOMAIN_VALUES = [
  'identity_access',
  'github_supply_chain',
  'eks_kubernetes',
  'network_ingress',
  'observability_incident',
  'secrets_audit',
  'terraform_state',
  'sdlc_governance',
] as const;
const LIFECYCLE_PHASE_VALUES = [
  'requirements',
  'risk_review',
  'source_control',
  'pull_request',
  'ci_validation',
  'image_build',
  'image_scan',
  'registry_publish',
  'gitops_update',
  'gitops_sync',
  'infrastructure_deploy',
  'infrastructure_destroy',
  'runtime_operations',
  'incident_response',
  'audit',
] as const;
const ACTOR_VALUES = [
  'junior_developer',
  'senior_developer',
  'devops',
  'security_reviewer',
  'github_actions_bot',
  'argo_cd_controller',
  'platform_controller',
  'application_workload',
  'kira_aiops',
  'terraform_apply_role',
  'operator',
  'auditor',
] as const;
const RESOURCE_TYPE_VALUES = [
  'issue_tracker',
  'architecture_doc',
  'github_repository',
  'github_workflow',
  'github_environment',
  'github_token',
  'terraform_module',
  'terraform_state',
  'aws_iam_role',
  'aws_iam_policy',
  'aws_iam_identity_center',
  'aws_oidc_provider',
  'aws_ecr_repository',
  'aws_eks_cluster',
  'aws_cloudwatch_log_group',
  'aws_route53_hosted_zone',
  'aws_secrets_manager',
  'aws_kms_key',
  'k8s_namespace',
  'k8s_service_account',
  'k8s_rbac',
  'k8s_gateway',
  'k8s_manifest',
  'argocd_application',
  'argocd_project',
  'admin_ui',
  'observability_tool',
  'runbook',
] as const;
const AWS_WA_VALUES = [
  'operational_excellence',
  'security',
  'reliability',
  'performance_efficiency',
  'cost_optimization',
  'sustainability',
] as const;
const CUSTOM_FRAMEWORK_VALUES = [
  'least_privilege',
  'supply_chain_security',
  'change_management',
  'gitops_governance',
  'platform_boundaries',
  'runtime_isolation',
  'secret_management',
  'auditability',
  'incident_readiness',
  'identity_governance',
] as const;
const STANDARD_VALUES = [
  'aws_well_architected_security_pillar',
  'cis_aws_foundations_benchmark',
  'cis_kubernetes_eks_benchmark',
  'nist_csf_2',
  'slsa',
] as const;
const ALIGNMENT_STATUS_VALUES = [
  'aligned',
  'partially_aligned',
  'not_aligned',
  'not_applicable',
  'accepted_risk',
  'external_dependency',
] as const;

const EXPECTED_REPORT_ROWS: Record<ReportName, number> = {
  sdlc_permission_lifecycle: 27,
  security_permission_design: 27,
};

const REPORT_TITLES: Record<ReportName, string> = {
  sdlc_permission_lifecycle: 'SDLC Permission Lifecycle',
  security_permission_design: 'Security Permission Design',
};

const STANDARD_TITLES: Record<StandardName, string> = {
  aws_well_architected_security_pillar: 'AWS Well-Architected Security Pillar',
  cis_aws_foundations_benchmark: 'CIS AWS Foundations Benchmark',
  cis_kubernetes_eks_benchmark: 'CIS Kubernetes / EKS Benchmark',
  nist_csf_2: 'NIST Cybersecurity Framework 2.0',
  slsa: 'SLSA',
};

type Status = typeof STATUS_VALUES[number];
type ReportName = typeof REPORT_VALUES[number];
type Domain = typeof DOMAIN_VALUES[number];
type StandardName = typeof STANDARD_VALUES[number];
type AlignmentStatus = typeof ALIGNMENT_STATUS_VALUES[number];

type Score = 1 | 2 | 3 | 4 | 5;

interface CliOptions {
  root: string;
  dataDir: string;
  standardsDir: string;
  outputDir: string;
  validateOnly: boolean;
}

interface ControlFile {
  schemaVersion: string;
  dataset: {
    id: string;
    title: string;
    version: string;
    domain: Domain;
    updatedAt: string;
  };
  controls: Control[];
}

interface Control {
  id: string;
  title: string;
  domain: Domain;
  lifecyclePhases: string[];
  actors: string[];
  resources: ResourceRef[];
  objective: string;
  rationale: string;
  boundarySummary: string;
  implementedSummary: string;
  gapSummary: string;
  status: Status;
  risk: RiskScores;
  frameworks: {
    awsWellArchitected: string[];
    custom: string[];
  };
  evidence: Evidence[];
  reportViews: ReportView[];
  sourceFile?: string;
}

interface RiskScores {
  impact: Score;
  likelihood: Score;
  exposure: Score;
  effort: Score;
  deploymentRisk: Score;
}

interface ResourceRef {
  type: string;
  name: string;
  scope?: string;
}

interface Evidence {
  path: string;
  summary: string;
}

interface ReportView {
  report: ReportName;
  section: string;
  rowTitle: string;
  sortKey?: number;
}

interface AnalysisControl extends Control {
  sourceFile: string;
  riskScore: number;
  priorityScore: number;
}

interface StandardFile {
  schemaVersion: string;
  standard: StandardMetadata;
  mappings: StandardMapping[];
}

interface StandardMetadata {
  id: StandardName;
  title: string;
  version: string;
  referenceUrl: string;
}

interface StandardMapping {
  standardControlId: string;
  standardControlTitle: string;
  standardControlFamily: string;
  projectControlIds: string[];
  alignmentStatus: AlignmentStatus;
  notes: string;
  gapSummary: string;
  sortKey?: number;
}

interface AnalysisStandardMapping extends StandardMapping {
  standard: StandardMetadata;
  sourceFile: string;
  projectControls: AnalysisControl[];
  evidence: Evidence[];
  riskScore: number;
  priorityScore: number;
}

function usage(): string {
  return 'Usage: permission-controls.mjs [--root repo-root] [--data-dir docs/reports/data/controls] [--standards-dir docs/reports/data/standards] [--output-dir docs/reports/build] [--validate-only]';
}

function parseArgs(argv: string[]): CliOptions {
  const args = [...argv];
  let root = process.cwd();
  let dataDir = 'docs/reports/data/controls';
  let standardsDir = 'docs/reports/data/standards';
  let outputDir = 'docs/reports/build';
  let validateOnly = false;

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '--root') {
      const value = args.shift();
      if (!value) throw new Error(`--root requires a value\n${usage()}`);
      root = value;
      continue;
    }
    if (arg === '--data-dir') {
      const value = args.shift();
      if (!value) throw new Error(`--data-dir requires a value\n${usage()}`);
      dataDir = value;
      continue;
    }
    if (arg === '--standards-dir') {
      const value = args.shift();
      if (!value) throw new Error(`--standards-dir requires a value\n${usage()}`);
      standardsDir = value;
      continue;
    }
    if (arg === '--output-dir') {
      const value = args.shift();
      if (!value) throw new Error(`--output-dir requires a value\n${usage()}`);
      outputDir = value;
      continue;
    }
    if (arg === '--validate-only') {
      validateOnly = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}\n${usage()}`);
  }

  const resolvedRoot = path.resolve(root);
  return {
    root: resolvedRoot,
    dataDir: path.resolve(resolvedRoot, dataDir),
    standardsDir: path.resolve(resolvedRoot, standardsDir),
    outputDir: path.resolve(resolvedRoot, outputDir),
    validateOnly,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isIntegerScore(value: unknown): value is Score {
  return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}

function enumError(value: string, allowed: readonly string[], pathName: string): string | undefined {
  return allowed.includes(value) ? undefined : `${pathName} has invalid value '${value}'`;
}

function validateStringArray(value: unknown, allowed: readonly string[], pathName: string, errors: string[]): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${pathName} must be a non-empty array`);
    return;
  }
  const seen = new Set<string>();
  for (const [index, item] of value.entries()) {
    if (!isString(item)) {
      errors.push(`${pathName}[${index}] must be a non-empty string`);
      continue;
    }
    const invalid = enumError(item, allowed, `${pathName}[${index}]`);
    if (invalid) errors.push(invalid);
    if (seen.has(item)) errors.push(`${pathName}[${index}] duplicates '${item}'`);
    seen.add(item);
  }
}

function validateControlFileShape(file: unknown, sourceFile: string): { file?: ControlFile; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(file)) return { errors: [`${sourceFile}: root must be an object`] };
  if (!isString(file.schemaVersion)) errors.push(`${sourceFile}: schemaVersion is required`);
  if (!isRecord(file.dataset)) {
    errors.push(`${sourceFile}: dataset is required`);
  } else {
    for (const field of ['id', 'title', 'version', 'updatedAt'] as const) {
      if (!isString(file.dataset[field])) errors.push(`${sourceFile}: dataset.${field} is required`);
    }
    if (!isString(file.dataset.domain)) {
      errors.push(`${sourceFile}: dataset.domain is required`);
    } else {
      const invalid = enumError(file.dataset.domain, DOMAIN_VALUES, `${sourceFile}: dataset.domain`);
      if (invalid) errors.push(invalid);
    }
  }
  if (!Array.isArray(file.controls) || file.controls.length === 0) {
    errors.push(`${sourceFile}: controls must be a non-empty array`);
  }
  if (errors.length > 0) return { errors };
  return { file: file as unknown as ControlFile, errors };
}

function validateControl(control: unknown, prefix: string): string[] {
  const errors: string[] = [];
  if (!isRecord(control)) return [`${prefix} must be an object`];

  for (const field of ['id', 'title', 'domain', 'objective', 'rationale', 'boundarySummary', 'implementedSummary', 'gapSummary', 'status'] as const) {
    if (!isString(control[field])) errors.push(`${prefix}.${field} is required`);
  }
  if (isString(control.id) && !/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(control.id)) errors.push(`${prefix}.id must use domain slug format`);
  if (isString(control.domain)) {
    const invalid = enumError(control.domain, DOMAIN_VALUES, `${prefix}.domain`);
    if (invalid) errors.push(invalid);
  }
  if (isString(control.status)) {
    const invalid = enumError(control.status, STATUS_VALUES, `${prefix}.status`);
    if (invalid) errors.push(invalid);
  }

  validateStringArray(control.lifecyclePhases, LIFECYCLE_PHASE_VALUES, `${prefix}.lifecyclePhases`, errors);
  validateStringArray(control.actors, ACTOR_VALUES, `${prefix}.actors`, errors);

  if (!Array.isArray(control.resources) || control.resources.length === 0) {
    errors.push(`${prefix}.resources must be a non-empty array`);
  } else {
    control.resources.forEach((resource, index) => {
      if (!isRecord(resource)) {
        errors.push(`${prefix}.resources[${index}] must be an object`);
        return;
      }
      if (!isString(resource.type)) {
        errors.push(`${prefix}.resources[${index}].type is required`);
      } else {
        const invalid = enumError(resource.type, RESOURCE_TYPE_VALUES, `${prefix}.resources[${index}].type`);
        if (invalid) errors.push(invalid);
      }
      if (!isString(resource.name)) errors.push(`${prefix}.resources[${index}].name is required`);
      if (resource.scope !== undefined && !isString(resource.scope)) errors.push(`${prefix}.resources[${index}].scope must be a non-empty string`);
    });
  }

  if (!isRecord(control.risk)) {
    errors.push(`${prefix}.risk is required`);
  } else {
    for (const field of ['impact', 'likelihood', 'exposure', 'effort', 'deploymentRisk'] as const) {
      if (!isIntegerScore(control.risk[field])) errors.push(`${prefix}.risk.${field} must be an integer from 1 to 5`);
    }
  }

  if (!isRecord(control.frameworks)) {
    errors.push(`${prefix}.frameworks is required`);
  } else {
    validateStringArray(control.frameworks.awsWellArchitected, AWS_WA_VALUES, `${prefix}.frameworks.awsWellArchitected`, errors);
    validateStringArray(control.frameworks.custom, CUSTOM_FRAMEWORK_VALUES, `${prefix}.frameworks.custom`, errors);
  }

  if (!Array.isArray(control.evidence) || control.evidence.length === 0) {
    errors.push(`${prefix}.evidence must be a non-empty array`);
  } else {
    control.evidence.forEach((evidence, index) => {
      if (!isRecord(evidence)) {
        errors.push(`${prefix}.evidence[${index}] must be an object`);
        return;
      }
      if (!isString(evidence.path)) errors.push(`${prefix}.evidence[${index}].path is required`);
      if (!isString(evidence.summary)) errors.push(`${prefix}.evidence[${index}].summary is required`);
    });
  }

  if (!Array.isArray(control.reportViews) || control.reportViews.length === 0) {
    errors.push(`${prefix}.reportViews must be a non-empty array`);
  } else {
    control.reportViews.forEach((view, index) => {
      if (!isRecord(view)) {
        errors.push(`${prefix}.reportViews[${index}] must be an object`);
        return;
      }
      if (!isString(view.report)) {
        errors.push(`${prefix}.reportViews[${index}].report is required`);
      } else {
        const invalid = enumError(view.report, REPORT_VALUES, `${prefix}.reportViews[${index}].report`);
        if (invalid) errors.push(invalid);
      }
      if (!isString(view.section)) errors.push(`${prefix}.reportViews[${index}].section is required`);
      if (!isString(view.rowTitle)) errors.push(`${prefix}.reportViews[${index}].rowTitle is required`);
      if (view.sortKey !== undefined && (!Number.isInteger(view.sortKey) || Number(view.sortKey) < 1)) {
        errors.push(`${prefix}.reportViews[${index}].sortKey must be a positive integer`);
      }
    });
  }

  return errors;
}

function validateStandardFileShape(file: unknown, sourceFile: string): { file?: StandardFile; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(file)) return { errors: [`${sourceFile}: root must be an object`] };
  if (!isString(file.schemaVersion)) errors.push(`${sourceFile}: schemaVersion is required`);
  if (!isRecord(file.standard)) {
    errors.push(`${sourceFile}: standard is required`);
  } else {
    for (const field of ['id', 'title', 'version', 'referenceUrl'] as const) {
      if (!isString(file.standard[field])) errors.push(`${sourceFile}: standard.${field} is required`);
    }
    if (isString(file.standard.id)) {
      const invalid = enumError(file.standard.id, STANDARD_VALUES, `${sourceFile}: standard.id`);
      if (invalid) errors.push(invalid);
    }
  }
  if (!Array.isArray(file.mappings) || file.mappings.length === 0) {
    errors.push(`${sourceFile}: mappings must be a non-empty array`);
  }
  if (errors.length > 0) return { errors };
  return { file: file as unknown as StandardFile, errors };
}

function validateStandardMapping(mapping: unknown, prefix: string): string[] {
  const errors: string[] = [];
  if (!isRecord(mapping)) return [`${prefix} must be an object`];

  for (const field of ['standardControlId', 'standardControlTitle', 'standardControlFamily', 'alignmentStatus', 'notes', 'gapSummary'] as const) {
    if (!isString(mapping[field])) errors.push(`${prefix}.${field} is required`);
  }
  if (isString(mapping.alignmentStatus)) {
    const invalid = enumError(mapping.alignmentStatus, ALIGNMENT_STATUS_VALUES, `${prefix}.alignmentStatus`);
    if (invalid) errors.push(invalid);
  }

  if (!Array.isArray(mapping.projectControlIds)) {
    errors.push(`${prefix}.projectControlIds must be an array`);
  } else {
    const seen = new Set<string>();
    for (const [index, projectControlId] of mapping.projectControlIds.entries()) {
      if (!isString(projectControlId)) {
        errors.push(`${prefix}.projectControlIds[${index}] must be a non-empty string`);
        continue;
      }
      if (!/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(projectControlId)) errors.push(`${prefix}.projectControlIds[${index}] must use domain slug format`);
      if (seen.has(projectControlId)) errors.push(`${prefix}.projectControlIds[${index}] duplicates '${projectControlId}'`);
      seen.add(projectControlId);
    }
    if (mapping.alignmentStatus !== 'not_applicable' && mapping.projectControlIds.length === 0) {
      errors.push(`${prefix}.projectControlIds must include evidence-backed project controls unless alignmentStatus is not_applicable`);
    }
  }

  if (mapping.sortKey !== undefined && (!Number.isInteger(mapping.sortKey) || Number(mapping.sortKey) < 1)) {
    errors.push(`${prefix}.sortKey must be a positive integer`);
  }

  return errors;
}

async function pathExistsInsideRoot(root: string, relativePath: string): Promise<boolean> {
  if (path.isAbsolute(relativePath)) return false;
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return false;
  try {
    await access(resolved);
    return true;
  } catch {
    return false;
  }
}

async function loadControls(options: CliOptions): Promise<{ controls: AnalysisControl[]; errors: string[] }> {
  const errors: string[] = [];
  const controls: AnalysisControl[] = [];
  const fileNames = (await readdir(options.dataDir)).filter((file) => file.endsWith('.json')).sort();
  if (fileNames.length === 0) {
    return { controls, errors: [`No JSON control files found in ${path.relative(options.root, options.dataDir)}`] };
  }

  for (const fileName of fileNames) {
    const absolutePath = path.join(options.dataDir, fileName);
    const sourceFile = path.relative(options.root, absolutePath);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(absolutePath, 'utf8')) as unknown;
    } catch (error) {
      errors.push(`${sourceFile}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const shape = validateControlFileShape(parsed, sourceFile);
    errors.push(...shape.errors);
    if (!shape.file) continue;

    const fileControlErrors = shape.file.controls.flatMap((control, index) =>
      validateControl(control, `${sourceFile}.controls[${index}]`),
    );
    errors.push(...fileControlErrors);
    if (fileControlErrors.length > 0) continue;

    for (const control of shape.file.controls) {
      const riskScore = control.risk.impact * control.risk.likelihood * control.risk.exposure;
      const priorityScore = riskScore - control.risk.effort - control.risk.deploymentRisk;
      controls.push({ ...control, sourceFile, riskScore, priorityScore });
    }
  }

  const ids = new Set<string>();
  const reportKeys = new Set<string>();
  const reportCounts: Record<ReportName, number> = { sdlc_permission_lifecycle: 0, security_permission_design: 0 };
  for (const control of controls) {
    if (ids.has(control.id)) errors.push(`Duplicate control id: ${control.id}`);
    ids.add(control.id);

    for (const evidence of control.evidence) {
      if (!(await pathExistsInsideRoot(options.root, evidence.path))) {
        errors.push(`${control.id}.evidence path does not exist or escapes repository root: ${evidence.path}`);
      }
    }

    for (const view of control.reportViews) {
      reportCounts[view.report] += 1;
      const key = `${view.report}:${view.sortKey ?? 'none'}`;
      if (reportKeys.has(key)) errors.push(`Duplicate report view: ${key}`);
      reportKeys.add(key);
    }
  }

  for (const report of REPORT_VALUES) {
    if (reportCounts[report] !== EXPECTED_REPORT_ROWS[report]) {
      errors.push(`${report} must have ${EXPECTED_REPORT_ROWS[report]} report views; found ${reportCounts[report]}`);
    }
  }

  return { controls, errors };
}

function uniqueEvidence(controls: AnalysisControl[]): Evidence[] {
  const evidence = new Map<string, Evidence>();
  for (const control of controls) {
    for (const item of control.evidence) evidence.set(`${item.path}\n${item.summary}`, item);
  }
  return [...evidence.values()].sort((a, b) => a.path.localeCompare(b.path));
}

async function loadStandardMappings(options: CliOptions, controls: AnalysisControl[]): Promise<{ mappings: AnalysisStandardMapping[]; errors: string[] }> {
  const errors: string[] = [];
  const mappings: AnalysisStandardMapping[] = [];
  const controlsById = new Map(controls.map((control) => [control.id, control]));
  const fileNames = (await readdir(options.standardsDir)).filter((file) => file.endsWith('.json')).sort();
  if (fileNames.length === 0) {
    return { mappings, errors: [`No JSON standards mapping files found in ${path.relative(options.root, options.standardsDir)}`] };
  }

  const seenStandards = new Set<StandardName>();
  const seenMappings = new Set<string>();
  for (const fileName of fileNames) {
    const absolutePath = path.join(options.standardsDir, fileName);
    const sourceFile = path.relative(options.root, absolutePath);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(absolutePath, 'utf8')) as unknown;
    } catch (error) {
      errors.push(`${sourceFile}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    const shape = validateStandardFileShape(parsed, sourceFile);
    errors.push(...shape.errors);
    if (!shape.file) continue;

    if (shape.file.standard.title !== STANDARD_TITLES[shape.file.standard.id]) {
      errors.push(`${sourceFile}: standard.title must be '${STANDARD_TITLES[shape.file.standard.id]}' for ${shape.file.standard.id}`);
    }
    if (seenStandards.has(shape.file.standard.id)) errors.push(`Duplicate standards file for ${shape.file.standard.id}`);
    seenStandards.add(shape.file.standard.id);

    const fileMappingErrors = shape.file.mappings.flatMap((mapping, index) =>
      validateStandardMapping(mapping, `${sourceFile}.mappings[${index}]`),
    );
    errors.push(...fileMappingErrors);
    if (fileMappingErrors.length > 0) continue;

    for (const mapping of shape.file.mappings) {
      const key = `${shape.file.standard.id}:${mapping.standardControlId}`;
      if (seenMappings.has(key)) errors.push(`Duplicate standards mapping: ${key}`);
      seenMappings.add(key);

      const projectControls = mapping.projectControlIds.flatMap((projectControlId) => {
        const control = controlsById.get(projectControlId);
        if (!control) {
          errors.push(`${sourceFile}:${mapping.standardControlId} references unknown project control '${projectControlId}'`);
          return [];
        }
        return [control];
      });

      if (mapping.alignmentStatus !== 'not_applicable' && projectControls.length === 0) {
        errors.push(`${sourceFile}:${mapping.standardControlId} must map to at least one existing evidence-backed project control`);
      }
      if (mapping.alignmentStatus !== 'not_applicable' && projectControls.some((control) => control.evidence.length === 0)) {
        errors.push(`${sourceFile}:${mapping.standardControlId} maps to a project control without evidence`);
      }

      mappings.push({
        ...mapping,
        standard: shape.file.standard,
        sourceFile,
        projectControls,
        evidence: uniqueEvidence(projectControls),
        riskScore: projectControls.length > 0 ? Math.max(...projectControls.map((control) => control.riskScore)) : 0,
        priorityScore: projectControls.length > 0 ? Math.max(...projectControls.map((control) => control.priorityScore)) : 0,
      });
    }
  }

  for (const standard of STANDARD_VALUES) {
    if (!seenStandards.has(standard)) errors.push(`Missing standards mapping file for ${standard}`);
  }

  return { mappings, errors };
}

function statusLabel(status: Status): string {
  return status.replaceAll('_', ' ');
}

function alignmentStatusLabel(status: AlignmentStatus): string {
  return status.replaceAll('_', ' ');
}

function markdownTableEscape(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return items.reduce<Record<K, T[]>>((groups, item) => {
    const key = keyFn(item);
    groups[key] ??= [];
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

function summarize(controls: AnalysisControl[]): object {
  const controlsByStatus = Object.fromEntries(STATUS_VALUES.map((status) => [status, controls.filter((control) => control.status === status).length]));
  const viewsByReport = Object.fromEntries(REPORT_VALUES.map((report) => [report, controls.reduce((count, control) => count + control.reportViews.filter((view) => view.report === report).length, 0)]));
  const domainCounts = DOMAIN_VALUES.map((domain) => ({ domain, count: controls.filter((control) => control.domain === domain).length }));
  const controlsByDomain = Object.fromEntries(domainCounts.filter(({ count }) => count > 0).map(({ domain, count }) => [domain, count]));
  const priorityControls = controls
    .filter((control) => control.status !== 'implemented')
    .sort((a, b) => b.priorityScore - a.priorityScore || b.riskScore - a.riskScore || a.risk.effort - b.risk.effort)
    .slice(0, 10)
    .map((control) => ({
      id: control.id,
      title: control.title,
      status: control.status,
      riskScore: control.riskScore,
      priorityScore: control.priorityScore,
      scores: control.risk,
      gapSummary: control.gapSummary,
      evidence: control.evidence.map((item) => item.path),
    }));

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      controls: controls.length,
      reportViews: controls.reduce((count, control) => count + control.reportViews.length, 0),
    },
    controlsByStatus,
    controlsByDomain,
    viewsByReport,
    priorityControls,
  };
}

function renderReport(controls: AnalysisControl[], analysis: object): string {
  const lines: string[] = [];
  lines.push('# Permission Controls Analysis');
  lines.push('');
  lines.push('Generated from canonical JSON control data. Do not hand-edit generated artifacts.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(analysis, null, 2));
  lines.push('```');
  lines.push('');

  const priorityControls = controls
    .filter((control) => control.status !== 'implemented')
    .sort((a, b) => b.priorityScore - a.priorityScore || b.riskScore - a.riskScore || a.risk.effort - b.risk.effort);

  lines.push('## Gap priority');
  lines.push('');
  lines.push('| Priority | Control | Status | Risk | Effort | Deployment risk | Gap | Evidence |');
  lines.push('| ---: | --- | --- | ---: | ---: | ---: | --- | --- |');
  priorityControls.forEach((control, index) => {
    lines.push(`| ${index + 1} | \`${control.id}\` ${markdownTableEscape(control.title)} | ${statusLabel(control.status)} | ${control.riskScore} | ${control.risk.effort} | ${control.risk.deploymentRisk} | ${markdownTableEscape(control.gapSummary)} | ${control.evidence.map((item) => `\`${item.path}\``).join('<br>')} |`);
  });
  lines.push('');

  for (const report of REPORT_VALUES) {
    lines.push(`## ${REPORT_TITLES[report]} view`);
    lines.push('');
    const rows = controls.flatMap((control) => control.reportViews
      .filter((view) => view.report === report)
      .map((view) => ({ control, view })));
    rows.sort((a, b) => (a.view.sortKey ?? 9999) - (b.view.sortKey ?? 9999) || a.view.section.localeCompare(b.view.section));
    const bySection = groupBy(rows, (row) => row.view.section);
    for (const [section, sectionRows] of Object.entries(bySection)) {
      lines.push(`### ${section}`);
      lines.push('');
      lines.push('| # | Row | Control | Status | Objective | Implemented | Gap |');
      lines.push('| ---: | --- | --- | --- | --- | --- | --- |');
      for (const row of sectionRows) {
        lines.push(`| ${row.view.sortKey ?? ''} | ${markdownTableEscape(row.view.rowTitle)} | \`${row.control.id}\` | ${statusLabel(row.control.status)} | ${markdownTableEscape(row.control.objective)} | ${markdownTableEscape(row.control.implementedSummary)} | ${markdownTableEscape(row.control.gapSummary)} |`);
      }
      lines.push('');
    }
  }

  return `${lines.join('\n')}\n`;
}

function summarizeStandards(mappings: AnalysisStandardMapping[]): object {
  const standards = STANDARD_VALUES.map((standard) => {
    const standardMappings = mappings.filter((mapping) => mapping.standard.id === standard);
    return {
      id: standard,
      title: STANDARD_TITLES[standard],
      mappings: standardMappings.length,
      countsByAlignmentStatus: Object.fromEntries(ALIGNMENT_STATUS_VALUES.map((status) => [status, standardMappings.filter((mapping) => mapping.alignmentStatus === status).length])),
      priorityGaps: standardMappings
        .filter((mapping) => !['aligned', 'not_applicable'].includes(mapping.alignmentStatus))
        .sort((a, b) => b.priorityScore - a.priorityScore || b.riskScore - a.riskScore)
        .slice(0, 5)
        .map((mapping) => ({
          standardControlId: mapping.standardControlId,
          alignmentStatus: mapping.alignmentStatus,
          riskScore: mapping.riskScore,
          priorityScore: mapping.priorityScore,
          gapSummary: mapping.gapSummary,
          projectControlIds: mapping.projectControlIds,
        })),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      standards: STANDARD_VALUES.length,
      mappings: mappings.length,
      projectControlsReferenced: new Set(mappings.flatMap((mapping) => mapping.projectControlIds)).size,
    },
    countsByAlignmentStatus: Object.fromEntries(ALIGNMENT_STATUS_VALUES.map((status) => [status, mappings.filter((mapping) => mapping.alignmentStatus === status).length])),
    standards,
  };
}

function standardMappingJson(mapping: AnalysisStandardMapping): object {
  return {
    standard: mapping.standard,
    standardControlId: mapping.standardControlId,
    standardControlTitle: mapping.standardControlTitle,
    standardControlFamily: mapping.standardControlFamily,
    alignmentStatus: mapping.alignmentStatus,
    notes: mapping.notes,
    gapSummary: mapping.gapSummary,
    riskScore: mapping.riskScore,
    priorityScore: mapping.priorityScore,
    sourceFile: mapping.sourceFile,
    projectControls: mapping.projectControls.map((control) => ({
      id: control.id,
      title: control.title,
      status: control.status,
      riskScore: control.riskScore,
      priorityScore: control.priorityScore,
      gapSummary: control.gapSummary,
      evidence: control.evidence,
    })),
    evidence: mapping.evidence,
  };
}

function renderStandardsAlignmentReport(mappings: AnalysisStandardMapping[], analysis: object): string {
  const lines: string[] = [];
  lines.push('# Standards Alignment Report');
  lines.push('');
  lines.push('Generated from canonical JSON control data and standards mapping files. Do not hand-edit generated artifacts.');
  lines.push('');
  lines.push('This report describes evidence-based standards alignment, not formal compliance or audit certification.');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(analysis, null, 2));
  lines.push('```');
  lines.push('');

  const priorityGaps = mappings
    .filter((mapping) => !['aligned', 'not_applicable'].includes(mapping.alignmentStatus))
    .sort((a, b) => b.priorityScore - a.priorityScore || b.riskScore - a.riskScore);

  lines.push('## Priority gaps across standards');
  lines.push('');
  lines.push('| Priority | Standard | Standard control | Alignment | Project controls | Gap | Risk priority |');
  lines.push('| ---: | --- | --- | --- | --- | --- | ---: |');
  priorityGaps.forEach((mapping, index) => {
    lines.push(`| ${index + 1} | ${markdownTableEscape(mapping.standard.title)} | \`${mapping.standardControlId}\` ${markdownTableEscape(mapping.standardControlTitle)} | ${alignmentStatusLabel(mapping.alignmentStatus)} | ${mapping.projectControls.map((control) => `\`${control.id}\``).join('<br>')} | ${markdownTableEscape(mapping.gapSummary)} | ${mapping.priorityScore} |`);
  });
  lines.push('');

  for (const standard of STANDARD_VALUES) {
    const standardMappings = mappings
      .filter((mapping) => mapping.standard.id === standard)
      .sort((a, b) => (a.sortKey ?? 9999) - (b.sortKey ?? 9999) || a.standardControlId.localeCompare(b.standardControlId));
    if (standardMappings.length === 0) continue;
    lines.push(`## ${STANDARD_TITLES[standard]}`);
    lines.push('');
    lines.push(`Reference: ${standardMappings[0]?.standard.referenceUrl}`);
    lines.push('');
    lines.push('| Standard control/family | Project control(s) | Alignment status | Evidence | Gap | Risk priority |');
    lines.push('| --- | --- | --- | --- | --- | ---: |');
    for (const mapping of standardMappings) {
      const standardCell = `\`${mapping.standardControlId}\` ${markdownTableEscape(mapping.standardControlTitle)}<br>${markdownTableEscape(mapping.standardControlFamily)}`;
      const projectCell = mapping.projectControls.map((control) => `\`${control.id}\` ${markdownTableEscape(control.title)} (${statusLabel(control.status)})`).join('<br>') || 'None';
      const evidenceCell = mapping.evidence.map((item) => `\`${item.path}\``).join('<br>') || 'None';
      lines.push(`| ${standardCell} | ${projectCell} | ${alignmentStatusLabel(mapping.alignmentStatus)} | ${evidenceCell} | ${markdownTableEscape(mapping.gapSummary)} | ${mapping.priorityScore} |`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const { controls, errors: controlErrors } = await loadControls(options);
  const { mappings, errors: standardsErrors } = await loadStandardMappings(options, controls);
  const errors = [...controlErrors, ...standardsErrors];
  if (errors.length > 0) {
    console.error(`Report validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${controls.length} permission controls with ${controls.reduce((count, control) => count + control.reportViews.length, 0)} report views.`);
  console.log(`Validated ${mappings.length} standards mappings across ${STANDARD_VALUES.length} standards.`);
  if (options.validateOnly) return;

  const analysis = summarize(controls);
  const standardsAnalysis = summarizeStandards(mappings);
  await mkdir(options.outputDir, { recursive: true });
  await writeFile(path.join(options.outputDir, 'permission-analysis.json'), `${JSON.stringify({ ...analysis, controls }, null, 2)}\n`);
  await writeFile(path.join(options.outputDir, 'permission-report.md'), renderReport(controls, analysis));
  await writeFile(path.join(options.outputDir, 'standards-alignment.json'), `${JSON.stringify({ ...standardsAnalysis, mappings: mappings.map(standardMappingJson) }, null, 2)}\n`);
  await writeFile(path.join(options.outputDir, 'standards-alignment.md'), renderStandardsAlignmentReport(mappings, standardsAnalysis));
  console.log(`Wrote ${path.relative(options.root, path.join(options.outputDir, 'permission-analysis.json'))}`);
  console.log(`Wrote ${path.relative(options.root, path.join(options.outputDir, 'permission-report.md'))}`);
  console.log(`Wrote ${path.relative(options.root, path.join(options.outputDir, 'standards-alignment.json'))}`);
  console.log(`Wrote ${path.relative(options.root, path.join(options.outputDir, 'standards-alignment.md'))}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
