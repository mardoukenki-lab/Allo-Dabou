/**
 * Utility to generate realistic Dabou Côte d'Ivoire VTC motorcycle license plates
 * Formats: DB-XXXX-CI01 or DB-XXXX-VT (e.g. DB-4829-CI01)
 */
export function generateLicensePlate(): string {
  const digits = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  const regionCodes = ['CI', 'VT', 'DB', 'AB'];
  const region = regionCodes[Math.floor(Math.random() * regionCodes.length)];
  const series = String(Math.floor(1 + Math.random() * 99)).padStart(2, '0');
  
  return `DB-${digits}-${region}${series}`;
}
