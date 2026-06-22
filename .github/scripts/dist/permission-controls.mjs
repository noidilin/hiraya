#!/usr/bin/env node
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
const STATUS_VALUES = ['implemented', 'partial', 'not_implemented', 'accepted_risk', 'external_dependency'];
const REPORT_VALUES = ['sdlc_permission_lifecycle', 'security_permission_design'];
const DOMAIN_VALUES = [
    'identity_access',
    'github_supply_chain',
    'eks_kubernetes',
    'network_ingress',
    'observability_incident',
    'secrets_audit',
    'terraform_state',
    'sdlc_governance',
];
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
];
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
];
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
];
const AWS_WA_VALUES = [
    'operational_excellence',
    'security',
    'reliability',
    'performance_efficiency',
    'cost_optimization',
    'sustainability',
];
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
];
const EXPECTED_REPORT_ROWS = {
    sdlc_permission_lifecycle: 27,
    security_permission_design: 27,
};
const REPORT_TITLES = {
    sdlc_permission_lifecycle: 'SDLC Permission Lifecycle',
    security_permission_design: 'Security Permission Design',
};
function usage() {
    return 'Usage: permission-controls.mjs [--root repo-root] [--data-dir docs/reports/data/controls] [--output-dir docs/reports/build] [--validate-only]';
}
function parseArgs(argv) {
    const args = [...argv];
    let root = process.cwd();
    let dataDir = 'docs/reports/data/controls';
    let outputDir = 'docs/reports/build';
    let validateOnly = false;
    while (args.length > 0) {
        const arg = args.shift();
        if (arg === '--root') {
            const value = args.shift();
            if (!value)
                throw new Error(`--root requires a value\n${usage()}`);
            root = value;
            continue;
        }
        if (arg === '--data-dir') {
            const value = args.shift();
            if (!value)
                throw new Error(`--data-dir requires a value\n${usage()}`);
            dataDir = value;
            continue;
        }
        if (arg === '--output-dir') {
            const value = args.shift();
            if (!value)
                throw new Error(`--output-dir requires a value\n${usage()}`);
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
        outputDir: path.resolve(resolvedRoot, outputDir),
        validateOnly,
    };
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
function isIntegerScore(value) {
    return Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5;
}
function enumError(value, allowed, pathName) {
    return allowed.includes(value) ? undefined : `${pathName} has invalid value '${value}'`;
}
function validateStringArray(value, allowed, pathName, errors) {
    if (!Array.isArray(value) || value.length === 0) {
        errors.push(`${pathName} must be a non-empty array`);
        return;
    }
    const seen = new Set();
    for (const [index, item] of value.entries()) {
        if (!isString(item)) {
            errors.push(`${pathName}[${index}] must be a non-empty string`);
            continue;
        }
        const invalid = enumError(item, allowed, `${pathName}[${index}]`);
        if (invalid)
            errors.push(invalid);
        if (seen.has(item))
            errors.push(`${pathName}[${index}] duplicates '${item}'`);
        seen.add(item);
    }
}
function validateControlFileShape(file, sourceFile) {
    const errors = [];
    if (!isRecord(file))
        return { errors: [`${sourceFile}: root must be an object`] };
    if (!isString(file.schemaVersion))
        errors.push(`${sourceFile}: schemaVersion is required`);
    if (!isRecord(file.dataset)) {
        errors.push(`${sourceFile}: dataset is required`);
    }
    else {
        for (const field of ['id', 'title', 'version', 'updatedAt']) {
            if (!isString(file.dataset[field]))
                errors.push(`${sourceFile}: dataset.${field} is required`);
        }
        if (!isString(file.dataset.domain)) {
            errors.push(`${sourceFile}: dataset.domain is required`);
        }
        else {
            const invalid = enumError(file.dataset.domain, DOMAIN_VALUES, `${sourceFile}: dataset.domain`);
            if (invalid)
                errors.push(invalid);
        }
    }
    if (!Array.isArray(file.controls) || file.controls.length === 0) {
        errors.push(`${sourceFile}: controls must be a non-empty array`);
    }
    if (errors.length > 0)
        return { errors };
    return { file: file, errors };
}
function validateControl(control, prefix) {
    const errors = [];
    if (!isRecord(control))
        return [`${prefix} must be an object`];
    for (const field of ['id', 'title', 'domain', 'objective', 'rationale', 'boundarySummary', 'implementedSummary', 'gapSummary', 'status']) {
        if (!isString(control[field]))
            errors.push(`${prefix}.${field} is required`);
    }
    if (isString(control.id) && !/^[a-z0-9]+(\.[a-z0-9-]+)+$/.test(control.id))
        errors.push(`${prefix}.id must use domain slug format`);
    if (isString(control.domain)) {
        const invalid = enumError(control.domain, DOMAIN_VALUES, `${prefix}.domain`);
        if (invalid)
            errors.push(invalid);
    }
    if (isString(control.status)) {
        const invalid = enumError(control.status, STATUS_VALUES, `${prefix}.status`);
        if (invalid)
            errors.push(invalid);
    }
    validateStringArray(control.lifecyclePhases, LIFECYCLE_PHASE_VALUES, `${prefix}.lifecyclePhases`, errors);
    validateStringArray(control.actors, ACTOR_VALUES, `${prefix}.actors`, errors);
    if (!Array.isArray(control.resources) || control.resources.length === 0) {
        errors.push(`${prefix}.resources must be a non-empty array`);
    }
    else {
        control.resources.forEach((resource, index) => {
            if (!isRecord(resource)) {
                errors.push(`${prefix}.resources[${index}] must be an object`);
                return;
            }
            if (!isString(resource.type)) {
                errors.push(`${prefix}.resources[${index}].type is required`);
            }
            else {
                const invalid = enumError(resource.type, RESOURCE_TYPE_VALUES, `${prefix}.resources[${index}].type`);
                if (invalid)
                    errors.push(invalid);
            }
            if (!isString(resource.name))
                errors.push(`${prefix}.resources[${index}].name is required`);
            if (resource.scope !== undefined && !isString(resource.scope))
                errors.push(`${prefix}.resources[${index}].scope must be a non-empty string`);
        });
    }
    if (!isRecord(control.risk)) {
        errors.push(`${prefix}.risk is required`);
    }
    else {
        for (const field of ['impact', 'likelihood', 'exposure', 'effort', 'deploymentRisk']) {
            if (!isIntegerScore(control.risk[field]))
                errors.push(`${prefix}.risk.${field} must be an integer from 1 to 5`);
        }
    }
    if (!isRecord(control.frameworks)) {
        errors.push(`${prefix}.frameworks is required`);
    }
    else {
        validateStringArray(control.frameworks.awsWellArchitected, AWS_WA_VALUES, `${prefix}.frameworks.awsWellArchitected`, errors);
        validateStringArray(control.frameworks.custom, CUSTOM_FRAMEWORK_VALUES, `${prefix}.frameworks.custom`, errors);
    }
    if (!Array.isArray(control.evidence) || control.evidence.length === 0) {
        errors.push(`${prefix}.evidence must be a non-empty array`);
    }
    else {
        control.evidence.forEach((evidence, index) => {
            if (!isRecord(evidence)) {
                errors.push(`${prefix}.evidence[${index}] must be an object`);
                return;
            }
            if (!isString(evidence.path))
                errors.push(`${prefix}.evidence[${index}].path is required`);
            if (!isString(evidence.summary))
                errors.push(`${prefix}.evidence[${index}].summary is required`);
        });
    }
    if (!Array.isArray(control.reportViews) || control.reportViews.length === 0) {
        errors.push(`${prefix}.reportViews must be a non-empty array`);
    }
    else {
        control.reportViews.forEach((view, index) => {
            if (!isRecord(view)) {
                errors.push(`${prefix}.reportViews[${index}] must be an object`);
                return;
            }
            if (!isString(view.report)) {
                errors.push(`${prefix}.reportViews[${index}].report is required`);
            }
            else {
                const invalid = enumError(view.report, REPORT_VALUES, `${prefix}.reportViews[${index}].report`);
                if (invalid)
                    errors.push(invalid);
            }
            if (!isString(view.section))
                errors.push(`${prefix}.reportViews[${index}].section is required`);
            if (!isString(view.rowTitle))
                errors.push(`${prefix}.reportViews[${index}].rowTitle is required`);
            if (view.sortKey !== undefined && (!Number.isInteger(view.sortKey) || Number(view.sortKey) < 1)) {
                errors.push(`${prefix}.reportViews[${index}].sortKey must be a positive integer`);
            }
        });
    }
    return errors;
}
async function pathExistsInsideRoot(root, relativePath) {
    if (path.isAbsolute(relativePath))
        return false;
    const resolved = path.resolve(root, relativePath);
    const relative = path.relative(root, resolved);
    if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative))
        return false;
    try {
        await access(resolved);
        return true;
    }
    catch {
        return false;
    }
}
async function loadControls(options) {
    const errors = [];
    const controls = [];
    const fileNames = (await readdir(options.dataDir)).filter((file) => file.endsWith('.json')).sort();
    if (fileNames.length === 0) {
        return { controls, errors: [`No JSON control files found in ${path.relative(options.root, options.dataDir)}`] };
    }
    for (const fileName of fileNames) {
        const absolutePath = path.join(options.dataDir, fileName);
        const sourceFile = path.relative(options.root, absolutePath);
        let parsed;
        try {
            parsed = JSON.parse(await readFile(absolutePath, 'utf8'));
        }
        catch (error) {
            errors.push(`${sourceFile}: invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
            continue;
        }
        const shape = validateControlFileShape(parsed, sourceFile);
        errors.push(...shape.errors);
        if (!shape.file)
            continue;
        shape.file.controls.forEach((control, index) => {
            errors.push(...validateControl(control, `${sourceFile}.controls[${index}]`));
        });
        for (const control of shape.file.controls) {
            const riskScore = control.risk.impact * control.risk.likelihood * control.risk.exposure;
            const priorityScore = riskScore - control.risk.effort - control.risk.deploymentRisk;
            controls.push({ ...control, sourceFile, riskScore, priorityScore });
        }
    }
    const ids = new Set();
    const reportKeys = new Set();
    const reportCounts = { sdlc_permission_lifecycle: 0, security_permission_design: 0 };
    for (const control of controls) {
        if (ids.has(control.id))
            errors.push(`Duplicate control id: ${control.id}`);
        ids.add(control.id);
        for (const evidence of control.evidence) {
            if (!(await pathExistsInsideRoot(options.root, evidence.path))) {
                errors.push(`${control.id}.evidence path does not exist or escapes repository root: ${evidence.path}`);
            }
        }
        for (const view of control.reportViews) {
            reportCounts[view.report] += 1;
            const key = `${view.report}:${view.sortKey ?? 'none'}:${view.rowTitle}`;
            if (reportKeys.has(key))
                errors.push(`Duplicate report view: ${key}`);
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
function statusLabel(status) {
    return status.replaceAll('_', ' ');
}
function markdownTableEscape(value) {
    return value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
}
function groupBy(items, keyFn) {
    return items.reduce((groups, item) => {
        const key = keyFn(item);
        groups[key] ??= [];
        groups[key].push(item);
        return groups;
    }, {});
}
function summarize(controls) {
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
function renderReport(controls, analysis) {
    const lines = [];
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
async function main() {
    const options = parseArgs(process.argv.slice(2));
    const { controls, errors } = await loadControls(options);
    if (errors.length > 0) {
        console.error(`Permission controls validation failed with ${errors.length} error(s):`);
        for (const error of errors)
            console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log(`Validated ${controls.length} permission controls with ${controls.reduce((count, control) => count + control.reportViews.length, 0)} report views.`);
    if (options.validateOnly)
        return;
    const analysis = summarize(controls);
    await mkdir(options.outputDir, { recursive: true });
    await writeFile(path.join(options.outputDir, 'permission-analysis.json'), `${JSON.stringify({ ...analysis, controls }, null, 2)}\n`);
    await writeFile(path.join(options.outputDir, 'permission-report.md'), renderReport(controls, analysis));
    console.log(`Wrote ${path.relative(options.root, path.join(options.outputDir, 'permission-analysis.json'))}`);
    console.log(`Wrote ${path.relative(options.root, path.join(options.outputDir, 'permission-report.md'))}`);
}
main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
});
