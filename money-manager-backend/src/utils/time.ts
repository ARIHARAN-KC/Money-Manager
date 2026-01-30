export const canEditTransaction = (createdAt?: Date): boolean => {
  if (!createdAt) return false;

  const now = Date.now();
  const diffHours = (now - createdAt.getTime()) / (1000 * 60 * 60);

  return diffHours <= 12;
};
