import { getSettings, saveSettings } from '@/lib/runtime';
import { settingsSchema } from '@/lib/validation';
import { authorize, body, json, failure } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET(){try{await authorize();return json({settings:await getSettings()});}catch(e){return failure(e);}}
export async function PUT(request:Request){try{await authorize(request);const settings=settingsSchema.parse(await body(request));await saveSettings(settings);return json({settings});}catch(e){return failure(e);}}
