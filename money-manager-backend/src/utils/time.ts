export const canEditTransaction = (createdAt: Date): boolean => {
  const now = new Date();
  const diffHours = (now.getTime() - createdAt.getTime()) / 1000 / 3600;
  return diffHours <= 12;
};
