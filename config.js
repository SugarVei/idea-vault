// 只放可公开的 publishable key：数据库由行级权限保护，只有 vault_admins 里的账号能写入。
// 不要在这里放 service_role / secret key。
export const SUPABASE_URL = 'https://yhtrifqtjcnhynpyndbz.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ARcJifW_WeVgG_i6VBNtvQ_Bq_blHXj';
export const BUCKET = 'idea-vault';
