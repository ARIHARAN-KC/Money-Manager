import apiClient from "../utils/apiClient";


//Dashboard api calls
export const getSummary = (type: "weekly" | "monthly" | "yearly", page = 1, limit = 10) =>
    apiClient.get(`/dashboard/summary?type=${type}&page=${page}&limit=${limit}`);

export const getCategorySummary = (page = 1, limit = 10) =>
    apiClient.get(`/dashboard/categories?page=${page}&limit=${limit}`);

export const getRangeTransactions = (
    from: string,
    to: string,
    page = 1,
    limit = 10
) =>
    apiClient.get(
        `/dashboard/range?from=${from}&to=${to}&page=${page}&limit=${limit}`
    );