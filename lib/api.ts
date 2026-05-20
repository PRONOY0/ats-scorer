const baseUrl = "/api/v1";
export const websiteUrl = "http://localhost:3000";
export const authentiCateUrl = `${baseUrl}/auth/sync`;
export const callUser = `${baseUrl}/user`;
export const analyzeResume = `${baseUrl}/resume/analyze`;
export const fetchResume_by_id = (id: string) => `${baseUrl}/resume/${id}`;
export const analytics_api = `${baseUrl}/resume/analytics`;
export const fetchResume_admin_api = `${baseUrl}/admin`;
export const fetchResume_api = `${baseUrl}/resume`;