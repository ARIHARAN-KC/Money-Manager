export const getPeriodStartDate = (period: string): Date => {
  const now = new Date();

  switch (period) {
    case "weekly": {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    }
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "yearly":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
};
