import api from './axios';

export const aiAPI = {
    // 1. Predictive Maintenance
    predictMaintenance: async (data) => {
        const response = await api.post('/ai/maintenance', data);
        return response.data;
    },

    // 2. Fuel CO2 Prediction + Anomaly
    predictFuelAnomaly: async (data) => {
        const response = await api.post('/ai/fuel', data);
        return response.data;
    },

    // 3. Delivery Delay
    predictDelay: async (data) => {
        const response = await api.post('/ai/delay', data);
        return response.data;
    },

    // 4. Vehicle Eco Score
    predictEcoScore: async (data) => {
        const response = await api.post('/ai/eco-score', data);
        return response.data;
    },

    // 5. Driver Behaviour Scoring
    predictDriverScore: async (data) => {
        const response = await api.post('/ai/driver-score', data);
        return response.data;
    },

    // 6. Carbon Emission Tracking
    predictCarbon: async (data) => {
        const response = await api.post('/ai/carbon', data);
        return response.data;
    },

    // 7. Route Time Estimation
    predictRoute: async (data) => {
        const response = await api.post('/ai/route', data);
        return response.data;
    },

    // Models Status
    getModelsStatus: async () => {
        const response = await api.get('/ai/models');
        return response.data;
    },
};
