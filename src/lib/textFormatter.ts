/**
 * Format hackathon description text to be more readable
 * Adds line breaks after certain patterns for better formatting
 */
export function formatHackathonDescription(text: string): string {
  if (!text) return text;
  
  let formatted = text;
  
  // Add line breaks after emojis followed by text (like "🚀TechSprint" -> "🚀\nTechSprint")
  formatted = formatted.replace(/([🚀🔥🏆🥇🥈🥉🛠📋🎯])([A-Za-z])/g, '$1\n$2');
  
  // Add line breaks before numbered lists (1. 2. 3. etc.)
  formatted = formatted.replace(/(\d+\.\s)/g, '\n$1');
  
  // Add line breaks before bullet points (• or -)
  formatted = formatted.replace(/([•-]\s)/g, '\n$1');
  
  // Add line breaks after sentences ending with periods followed by capital letters
  formatted = formatted.replace(/(\.\s)([A-Z])/g, '$1\n$2');
  
  // Add line breaks after exclamation marks followed by capital letters
  formatted = formatted.replace(/(!)\s([A-Z])/g, '$1\n$2');
  
  // Add line breaks before common section headers
  formatted = formatted.replace(/(Hackathon Tracks|Prize Pool|Details|Winner|Runner-up)/g, '\n$1');
  
  // Add line breaks before "Team Size:", "Mode:", "Tech Stack:" etc.
  formatted = formatted.replace(/(Team Size:|Mode:|Tech Stack:)/g, '\n$1');
  
  // Clean up multiple consecutive line breaks
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Trim leading/trailing whitespace
  formatted = formatted.trim();
  
  return formatted;
}

/**
 * Format text for display with proper line breaks
 * This is a more aggressive formatter for better readability
 */
export function formatTextForDisplay(text: string): string {
  if (!text) return text;
  
  let formatted = formatHackathonDescription(text);
  
  // Additional formatting for better display
  // Add spacing around prize amounts
  formatted = formatted.replace(/(₹[\d,]+)/g, ' $1 ');
  
  // Clean up extra spaces
  formatted = formatted.replace(/\s{2,}/g, ' ');
  
  // Ensure proper spacing after line breaks
  formatted = formatted.replace(/\n\s+/g, '\n');
  
  return formatted;
}