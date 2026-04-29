
import { EBA_EVENT_TYPES_HIERARCHY } from '../../types';

const MODEL = 'gemini-2.5-flash';

export interface ClassificationResult {
    eventType: string;
    eventTypeLevel2: string;
    rationale: string;
}

export const classifyEvent = async (title: string, description: string): Promise<ClassificationResult | null> => {
    const apiKey = (process.env.GEMINI_API_KEY as string) || (process.env.API_KEY as string);
    if (!apiKey) {
        return null;
    }

    const taxonomy = Object.entries(EBA_EVENT_TYPES_HIERARCHY)
        .map(([l1, l2]) => `${l1}: ${l2.join(' | ')}`)
        .join('\n');

    const prompt = `Classify the operational risk event into the EBA taxonomy. Reply ONLY with JSON: {"eventType":"<L1>","eventTypeLevel2":"<L2>","rationale":"<one sentence>"}.

Taxonomy:
${taxonomy}

Event title: ${title}
Description: ${description}`;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
                })
            }
        );
        if (!res.ok) return null;
        const json = await res.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;
        const parsed = JSON.parse(text);
        if (!parsed.eventType || !parsed.eventTypeLevel2) return null;
        return parsed;
    } catch (e) {
        console.error('Gemini classify error:', e);
        return null;
    }
};
