// The only databases the acceptance suite may run against: the hosted test
// project, and the local Supabase stack the offline tier starts.
const ACCEPTANCE_DATABASE_URLS = [
  "https://tgccxydchvujhrqyzqao.supabase.co",
  "http://127.0.0.1:54321",
];

export function isAcceptanceDatabaseUrl(url: string | undefined): boolean {
  return url !== undefined && ACCEPTANCE_DATABASE_URLS.includes(url);
}
