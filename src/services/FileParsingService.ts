
import { OpEvent, Department, Process, RiskItem, Control, EBA_EVENT_TYPES, EBA_EVENT_TYPES_HIERARCHY, BUSINESS_LINES } from '../../types';

export interface ValidationError {
    row: number;
    field: string;
    message: string;
    value: string;
}

export const FileParsingService = {
    /**
     * Parse a CSV string into an array of objects
     */
    parseCsv: (csvText: string): string[][] => {
        const lines = csvText.split(/\r?\n/);
        return lines
            .filter(line => line.trim() !== '')
            .map(line => {
                // Handle basic quoted CSV
                const result = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') inQuotes = !inQuotes;
                    else if (char === ';' && !inQuotes) {
                        result.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                result.push(current.trim());
                return result;
            });
    },

    /**
     * Generate CSV for validation errors
     */
    generateErrorReport: (errors: ValidationError[]): string => {
        const header = "Row;Field;Error;Value";
        const rows = errors.map(e => `${e.row};${e.field};${e.message};"${e.value.replace(/"/g, '""')}"`);
        return "\uFEFF" + [header, ...rows].join("\n");
    },

    /**
     * Validate and Parse Events
     */
    processEvents: (data: string[][], departments: Department[], processes: Process[]): { items: OpEvent[], errors: ValidationError[] } => {
        const items: OpEvent[] = [];
        const errors: ValidationError[] = [];
        const headers = data[0].map(h => h.toLowerCase());

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const get = (name: string) => row[headers.indexOf(name)] || '';

            const date = get('date');
            const title = get('title');
            const amount = parseFloat(get('amount'));
            const type1 = get('eventtype');
            const type2 = get('level2');
            const bl = get('businessline');
            const dept = get('dept');
            const procId = get('processid');
            const email = get('email');
            const desc = get('description');

            // Validations
            if (!date) errors.push({ row: i + 1, field: 'Date', message: 'Required', value: '' });
            if (!title) errors.push({ row: i + 1, field: 'Title', message: 'Required', value: '' });
            if (isNaN(amount)) errors.push({ row: i + 1, field: 'Amount', message: 'Invalid number', value: get('amount') });
            if (!EBA_EVENT_TYPES.includes(type1)) errors.push({ row: i + 1, field: 'EventType', message: 'Invalid EBA Level 1', value: type1 });
            if (type1 && EBA_EVENT_TYPES_HIERARCHY[type1] && !EBA_EVENT_TYPES_HIERARCHY[type1].includes(type2)) {
                errors.push({ row: i + 1, field: 'Level2', message: `Invalid Level 2 for ${type1}`, value: type2 });
            }
            if (!BUSINESS_LINES.includes(bl)) errors.push({ row: i + 1, field: 'BusinessLine', message: 'Invalid Business Line', value: bl });

            if (errors.length === 0) {
                items.push({
                    id: `EVT-IMP-${Date.now()}-${i}`,
                    dateDiscovery: date,
                    title: title,
                    amount: amount,
                    currency: 'EUR',
                    eventType: type1,
                    eventTypeLevel2: type2,
                    businessLine: bl,
                    department: dept,
                    processId: procId,
                    employeeEmail: email,
                    description: desc,
                    status: 'Pending Validation',
                    auditTrail: [{ date: new Date().toLocaleString(), user: 'Import Worker', action: 'Imported via CSV' }]
                });
            }
        }

        return { items, errors };
    },

    /**
     * Validate and Parse RCSA
     */
    processRCSA: (data: string[][]): {
        departments: Department[],
        processes: Process[],
        risks: RiskItem[],
        controls: Control[],
        errors: ValidationError[]
    } => {
        const depts: Department[] = [];
        const procs: Process[] = [];
        const risks: RiskItem[] = [];
        const ctrls: Control[] = [];
        const errors: ValidationError[] = [];
        const headers = data[0].map(h => h.toLowerCase());

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const get = (name: string) => row[headers.indexOf(name)] || '';

            const type = get('type').toUpperCase();
            const id = get('id');
            const name = get('name');
            const parentId = get('parentid');

            if (!type || !['DEPT', 'PROC', 'RISK', 'CTRL'].includes(type)) {
                errors.push({ row: i + 1, field: 'Type', message: 'Must be DEPT, PROC, RISK, or CTRL', value: type });
                continue;
            }

            if (!name) {
                errors.push({ row: i + 1, field: 'Name', message: 'Required', value: '' });
                continue;
            }

            switch (type) {
                case 'DEPT':
                    depts.push({ id: id || `DEP-${name.substring(0, 3).toUpperCase()}`, name });
                    break;
                case 'PROC':
                    if (!parentId) errors.push({ row: i + 1, field: 'ParentID', message: 'Required for Process', value: '' });
                    else procs.push({ id: id || `PRC-${name.substring(0, 3).toUpperCase()}`, name, departmentId: parentId, owner: get('owner') });
                    break;
                case 'RISK':
                    if (!parentId) errors.push({ row: i + 1, field: 'ParentID', message: 'Required for Risk', value: '' });
                    else risks.push({
                        id: id || `RSK-${name.substring(0, 3).toUpperCase()}`,
                        name,
                        processId: parentId,
                        description: get('description'),
                        inherentProb: parseInt(get('inherentprob')) || 1,
                        inherentImpact: parseInt(get('inherentimpact')) || 1,
                        residualProb: parseInt(get('residualprob')) || 1,
                        residualImpact: parseInt(get('residualimpact')) || 1,
                        controlIds: []
                    });
                    break;
                case 'CTRL':
                    if (!parentId) errors.push({ row: i + 1, field: 'ParentID', message: 'Required for Control', value: '' });
                    else ctrls.push({
                        id: id || `CTL-${name.substring(0, 3).toUpperCase()}`,
                        riskId: parentId,
                        name,
                        description: get('description'),
                        owner: get('owner'),
                        type: (get('controltype') as any) || 'Preventive',
                        frequency: (get('frequency') as any) || 'Daily',
                        testingFrequency: (get('testfrequency') as any) || 'Monthly',
                        status: 'Pending'
                    });
                    break;
            }
        }

        return { departments: depts, processes: procs, risks: risks, controls: ctrls, errors };
    }
};
