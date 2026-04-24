import { api } from '../api/axios';
import type { DashboardSummary } from '../types/dashboard';

export const dashboardService = {
  async getSummary(month?: string): Promise<DashboardSummary> {
    const { data } = await api.get<DashboardSummary>('/dashboard/summary', {
      params: month ? { month } : undefined
    });

    return data;
  }
};