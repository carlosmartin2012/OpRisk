
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwzrxdtoykphvqsiwmew.supabase.co';
const supabaseKey = 'sb_publishable_wm_zRmQ1gdm8TyB7SMJqtw_xMFGkCD-';

export const supabase = createClient(supabaseUrl, supabaseKey);
