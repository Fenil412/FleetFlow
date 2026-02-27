import * as analyticsService from '../services/analytics.service.js';
import { asyncWrapper } from '../middleware/error.middleware.js';

export const getDashboard = asyncWrapper(async (req, res) => {
    const data = await analyticsService.getDashboardKPIs();
    res.json({ status: 'success', data });
});

export const getROI = asyncWrapper(async (req, res) => {
    const data = await analyticsService.getVehicleROI();
    res.json({ status: 'success', data });
});

export const getEfficiency = asyncWrapper(async (req, res) => {
    const data = await analyticsService.getFuelEfficiency();
    res.json({ status: 'success', data: { efficiency: data } });
});

export const getFinancials = asyncWrapper(async (req, res) => {
    const data = await analyticsService.getMonthlyFinancials();
    res.json({ status: 'success', data: { monthly: data } });
});
