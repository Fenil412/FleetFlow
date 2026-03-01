/**
 * ai.routes.js — FleetFlow AI Service Proxy
 * ──────────────────────────────────────────
 * Proxies all /api/ai/* requests to the FastAPI AI service
 * running on http://localhost:8001
 *
 * Endpoints exposed through backend:
 *   POST /api/ai/maintenance    → Predictive Maintenance
 *   POST /api/ai/fuel           → Fuel CO2 + Anomaly Detection
 *   POST /api/ai/delay          → Delivery Delay Prediction
 *   POST /api/ai/eco-score      → Vehicle Eco Score
 *   POST /api/ai/driver-score   → Driver Behaviour Scoring
 *   POST /api/ai/carbon         → Carbon Emission Tracking
 *   POST /api/ai/route          → Route Time Estimation
 *   GET  /api/ai/health         → AI Service Health
 *   GET  /api/ai/models         → Loaded Model Status
 */

import express from 'express';
import http from 'http';

const router = express.Router();

const AI_HOST = process.env.AI_SERVICE_HOST || 'localhost';
const AI_PORT = process.env.AI_SERVICE_PORT || 8001;

/**
 * Generic proxy function — forwards request body to FastAPI and
 * streams the JSON response back to the client.
 */
function proxyToAI(aiPath) {
    return async (req, res) => {
        const body = JSON.stringify(req.body);
        const method = req.method;

        const options = {
            hostname: AI_HOST,
            port: AI_PORT,
            path: aiPath,
            method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const proxyReq = http.request(options, (proxyRes) => {
            let data = '';
            proxyRes.on('data', (chunk) => (data += chunk));
            proxyRes.on('end', () => {
                res.status(proxyRes.statusCode).json(
                    (() => {
                        try {
                            return JSON.parse(data);
                        } catch {
                            return { error: 'Invalid response from AI service', raw: data };
                        }
                    })()
                );
            });
        });

        proxyReq.on('error', (err) => {
            console.error('[AI Proxy] Connection error:', err.message);
            res.status(503).json({
                error: 'AI service unavailable. Make sure the Python FastAPI server is running on port 8001.',
                details: err.message,
            });
        });

        if (method !== 'GET') proxyReq.write(body);
        proxyReq.end();
    };
}

// ── ML Endpoints ──────────────────────────────────────────────────────────────
router.post('/maintenance', proxyToAI('/predict/maintenance'));
router.post('/fuel', proxyToAI('/predict/fuel'));
router.post('/delay', proxyToAI('/predict/delay'));
router.post('/eco-score', proxyToAI('/predict/eco-score'));

// ── Rule-Based Endpoints ───────────────────────────────────────────────────────
router.post('/driver-score', proxyToAI('/predict/driver-score'));
router.post('/carbon', proxyToAI('/predict/carbon'));
router.post('/route', proxyToAI('/predict/route'));

// ── System Endpoints ───────────────────────────────────────────────────────────
router.get('/health', proxyToAI('/health'));
router.get('/models', proxyToAI('/models/status'));

export default router;
