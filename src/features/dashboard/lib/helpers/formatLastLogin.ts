export function formatLastLogin(dateValue?: string | null): string {
  if (!dateValue) {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `TODAY, ${hours}:${minutes} EST`;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "TODAY, 14:52 EST";
  }

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `TODAY, ${hours}:${minutes} EST`;
}
