// Generates a unique ID for each expense or record
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
