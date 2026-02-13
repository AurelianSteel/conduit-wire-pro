/**
 * Formats wire size for display
 * @param size - Wire size code (e.g., '12', '1/0', '250')
 * @returns Formatted string (e.g., '12 AWG', '1/0 AWG', '250 kcmil')
 */
export function formatWireSize(size: string): string {
  // Parse size
  const numericSize = size.includes('/') ? 0 : parseInt(size, 10);
  
  // kcmil (250+)
  if (numericSize >= 250) {
    return `${size} kcmil`;
  }
  
  // AWG (all others)
  return `${size} AWG`;
}