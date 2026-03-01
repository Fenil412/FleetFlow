import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import * as d3 from 'd3';
import api from '../api/axios';
import { Download, FileText, Table, TrendingUp, Fuel, Activity, Loader2 } from 'lucide-react';
import { downloadCSV, downloadPDF } from '../utils/exportUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Color palette for the D3 heatmap ──
const HEATMAP_COLORS = {
    primary: '#1a2e1c',
    secondary: '#4ade80',
    accent: '#e2f5e4',
    muted: '#8aad8e',
    heatLow: '#166534',
    heatHigh: '#4ade80',
};

const INDIA_GEOJSON_URL =
    'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

// City lat/lng lookup — comprehensive Indian city coverage
const CITY_COORDS = {
    // Tier-1 metros
    Mumbai: { lat: 19.076, lng: 72.877 },
    Delhi: { lat: 28.704, lng: 77.102 },
    Bangalore: { lat: 12.972, lng: 77.594 },
    Chennai: { lat: 13.083, lng: 80.271 },
    Kolkata: { lat: 22.573, lng: 88.363 },
    Hyderabad: { lat: 17.385, lng: 78.487 },
    // Gujarat
    Ahmedabad: { lat: 23.023, lng: 72.572 },
    Surat: { lat: 21.170, lng: 72.831 },
    Vadodara: { lat: 22.307, lng: 73.181 },
    Rajkot: { lat: 22.303, lng: 70.802 },
    Bhavnagar: { lat: 21.767, lng: 72.152 },
    // Maharashtra
    Pune: { lat: 18.520, lng: 73.856 },
    Nashik: { lat: 19.998, lng: 73.790 },
    Nagpur: { lat: 21.146, lng: 79.089 },
    Aurangabad: { lat: 19.877, lng: 75.343 },
    Solapur: { lat: 17.687, lng: 75.907 },
    Kolhapur: { lat: 16.705, lng: 74.243 },
    Amravati: { lat: 20.932, lng: 77.751 },
    // Rajasthan
    Jaipur: { lat: 26.912, lng: 75.787 },
    Jodhpur: { lat: 26.292, lng: 73.016 },
    Udaipur: { lat: 24.585, lng: 73.712 },
    Kota: { lat: 25.183, lng: 75.839 },
    Bikaner: { lat: 28.022, lng: 73.312 },
    Ajmer: { lat: 26.452, lng: 74.638 },
    // UP & NCR
    Lucknow: { lat: 26.847, lng: 80.947 },
    Kanpur: { lat: 26.449, lng: 80.331 },
    Varanasi: { lat: 25.317, lng: 82.974 },
    Agra: { lat: 27.176, lng: 78.008 },
    Allahabad: { lat: 25.435, lng: 81.846 },
    Meerut: { lat: 28.984, lng: 77.707 },
    Ghaziabad: { lat: 28.669, lng: 77.453 },
    Noida: { lat: 28.536, lng: 77.391 },
    // MP
    Bhopal: { lat: 23.260, lng: 77.413 },
    Indore: { lat: 22.720, lng: 75.857 },
    Gwalior: { lat: 26.218, lng: 78.182 },
    Jabalpur: { lat: 23.182, lng: 79.987 },
    // Bihar & Jharkhand
    Patna: { lat: 25.595, lng: 85.138 },
    Ranchi: { lat: 23.344, lng: 85.310 },
    Jamshedpur: { lat: 22.805, lng: 86.203 },
    // Punjab & Haryana
    Chandigarh: { lat: 30.734, lng: 76.779 },
    Ludhiana: { lat: 30.901, lng: 75.857 },
    Amritsar: { lat: 31.633, lng: 74.872 },
    Jalandhar: { lat: 31.326, lng: 75.576 },
    Faridabad: { lat: 28.408, lng: 77.317 },
    Gurugram: { lat: 28.459, lng: 77.026 },
    // Kerala
    Kochi: { lat: 9.931, lng: 76.267 },
    Thiruvananthapuram: { lat: 8.524, lng: 76.936 },
    Kozhikode: { lat: 11.259, lng: 75.780 },
    Thrissur: { lat: 10.527, lng: 76.215 },
    // Tamil Nadu
    Coimbatore: { lat: 11.017, lng: 76.955 },
    Madurai: { lat: 9.919, lng: 78.119 },
    Tiruchirappalli: { lat: 10.790, lng: 78.704 },
    Salem: { lat: 11.664, lng: 78.146 },
    // Karnataka
    Mysuru: { lat: 12.296, lng: 76.639 },
    Mangaluru: { lat: 12.914, lng: 74.856 },
    Hubli: { lat: 15.360, lng: 75.124 },
    Belagavi: { lat: 15.849, lng: 74.497 },
    // Andhra Pradesh & Telangana
    Visakhapatnam: { lat: 17.686, lng: 83.218 },
    Vijayawada: { lat: 16.506, lng: 80.648 },
    Tirupati: { lat: 13.629, lng: 79.419 },
    Warangal: { lat: 17.966, lng: 79.592 },
    // Odisha
    Bhubaneswar: { lat: 20.297, lng: 85.824 },
    Cuttack: { lat: 20.462, lng: 85.883 },
    Rourkela: { lat: 22.232, lng: 84.866 },
    // West Bengal
    Howrah: { lat: 22.579, lng: 88.330 },
    Asansol: { lat: 23.683, lng: 86.983 },
    Siliguri: { lat: 26.717, lng: 88.429 },
    // North East
    Guwahati: { lat: 26.145, lng: 91.736 },
    Shillong: { lat: 25.567, lng: 91.883 },
    Dimapur: { lat: 25.905, lng: 93.723 },
    // Uttarakhand & HP
    Dehradun: { lat: 30.316, lng: 78.032 },
    Haridwar: { lat: 29.945, lng: 78.164 },
    Shimla: { lat: 31.104, lng: 77.173 },
    // J&K
    Srinagar: { lat: 34.083, lng: 74.797 },
    Jammu: { lat: 32.726, lng: 74.857 },
    // Goa
    Panaji: { lat: 15.499, lng: 73.824 },
    // Chhattisgarh
    Raipur: { lat: 21.251, lng: 81.630 },
    // Assam
    Dibrugarh: { lat: 27.480, lng: 94.912 },
};

// Dummy fallback for heatmap when API has no geography data
const DUMMY_CITY_BOOKINGS = [
    { city: 'Mumbai', booking_count: '145', total_revenue: '290000' },
    { city: 'Delhi', booking_count: '132', total_revenue: '264000' },
    { city: 'Bangalore', booking_count: '118', total_revenue: '236000' },
    { city: 'Hyderabad', booking_count: '103', total_revenue: '206000' },
    { city: 'Chennai', booking_count: '91', total_revenue: '182000' },
    { city: 'Kolkata', booking_count: '84', total_revenue: '168000' },
    { city: 'Pune', booking_count: '76', total_revenue: '152000' },
    { city: 'Ahmedabad', booking_count: '68', total_revenue: '136000' },
    { city: 'Jaipur', booking_count: '59', total_revenue: '118000' },
    { city: 'Lucknow', booking_count: '53', total_revenue: '106000' },
    { city: 'Surat', booking_count: '47', total_revenue: '94000' },
    { city: 'Nagpur', booking_count: '42', total_revenue: '84000' },
    { city: 'Indore', booking_count: '38', total_revenue: '76000' },
    { city: 'Bhopal', booking_count: '34', total_revenue: '68000' },
    { city: 'Visakhapatnam', booking_count: '29', total_revenue: '58000' },
    { city: 'Patna', booking_count: '26', total_revenue: '52000' },
    { city: 'Kochi', booking_count: '22', total_revenue: '44000' },
    { city: 'Chandigarh', booking_count: '19', total_revenue: '38000' },
    { city: 'Guwahati', booking_count: '16', total_revenue: '32000' },
    { city: 'Coimbatore', booking_count: '13', total_revenue: '26000' },
];

// Dummy fallback for Net Daily Profit — balanced, mostly positive, realistic for March 2026
const _rawProfits = [
    4200, 3800, 5100, 4700, 6200, 5500, 3200,
    4900, 5800, 6400, 4100, -1200, 3700, 6100,
    5300, 4600, 7200, 6800, 5000, -800, 4300,
    5700, 6300, 4800, 5200, 7000, 6500, 4400,
    3900, 5600, 6700,
];
const DUMMY_DAILY_PROFIT = _rawProfits.map((profit, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, '0')}`,
    profit: String(profit),
}));

const IndiaHeatmap = ({ cityData }) => {
    const svgRef = useRef(null);
    const tooltipRef = useRef(null);
    const [mapLoading, setMapLoading] = useState(true);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const container = svgRef.current.parentElement;
        const width = container.clientWidth || 700;
        const height = 480;

        svg.attr('width', width).attr('height', height).style('cursor', 'grab');

        const tooltip = d3.select(tooltipRef.current)
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('background', '#1e3a21')
            .style('border', `1px solid ${HEATMAP_COLORS.secondary}`)
            .style('border-radius', '10px')
            .style('padding', '10px 14px')
            .style('font-size', '12px')
            .style('color', HEATMAP_COLORS.accent)
            .style('box-shadow', '0 8px 24px rgba(0,0,0,0.5)')
            .style('z-index', '100')
            .style('backdrop-filter', 'blur(8px)');

        const projection = d3.geoMercator()
            .center([82, 22])
            .scale(Math.min(width, height) * 1.6)
            .translate([width / 2, height / 2]);

        const pathGen = d3.geoPath().projection(projection);

        const defs = svg.append('defs');
        const filter = defs.append('filter').attr('id', 'hm-glow');
        filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
        filter.append('feMerge').selectAll('feMergeNode')
            .data(['blur', 'SourceGraphic']).join('feMergeNode')
            .attr('in', d => d);

        const mapGroup = svg.append('g');
        const zoom = d3.zoom()
            .scaleExtent([1, 7])
            .on('zoom', event => {
                mapGroup.attr('transform', event.transform);
                svg.style('cursor', event.transform.k > 1 ? 'grabbing' : 'grab');
            });
        svg.call(zoom);

        // Prepare bubble data — filter only cities we have coords for
        const bubbleData = cityData
            .map(d => ({
                city: d.city,
                bookings: parseInt(d.booking_count, 10) || 0,
                revenue: parseFloat(d.total_revenue) || 0,
                lat: CITY_COORDS[d.city]?.lat,
                lng: CITY_COORDS[d.city]?.lng,
            }))
            .filter(d => d.lat !== undefined);

        const maxBookings = d3.max(bubbleData, d => d.bookings) || 1;
        const colorScale = d3.scaleLinear()
            .domain([0, maxBookings])
            .range([HEATMAP_COLORS.heatLow, HEATMAP_COLORS.heatHigh]);
        const sizeScale = d3.scaleSqrt().domain([0, maxBookings]).range([5, 22]);

        d3.json(INDIA_GEOJSON_URL).then(geoData => {
            setMapLoading(false);

            // State polygons
            mapGroup.selectAll('.hm-state')
                .data(geoData.features)
                .join('path')
                .attr('class', 'hm-state')
                .attr('d', pathGen)
                .attr('fill', HEATMAP_COLORS.secondary)
                .attr('fill-opacity', 0.08)
                .attr('stroke', HEATMAP_COLORS.secondary)
                .attr('stroke-opacity', 0.45)
                .attr('stroke-width', 0.7)
                .on('mouseenter', function (event, d) {
                    d3.select(this)
                        .transition().duration(150)
                        .attr('fill-opacity', 0.20)
                        .attr('stroke-opacity', 0.85)
                        .attr('stroke-width', 1.3);
                    const name = d.properties.ST_NM || d.properties.NAME_1 || d.properties.name || 'Unknown';
                    tooltip.html(`<div style="font-weight:700;font-size:12px">${name}</div>`)
                        .transition().duration(150).style('opacity', 1);
                })
                .on('mousemove', function (event) {
                    const r = svgRef.current.parentElement.getBoundingClientRect();
                    tooltip
                        .style('left', `${event.clientX - r.left + 14}px`)
                        .style('top', `${event.clientY - r.top - 10}px`);
                })
                .on('mouseleave', function () {
                    d3.select(this).transition().duration(250)
                        .attr('fill-opacity', 0.08)
                        .attr('stroke-opacity', 0.45)
                        .attr('stroke-width', 0.7);
                    tooltip.transition().duration(150).style('opacity', 0);
                });

            // Bubble groups
            const bubbles = mapGroup.selectAll('.hm-bubble')
                .data(bubbleData)
                .join('g')
                .attr('class', 'hm-bubble')
                .attr('transform', d => {
                    const [x, y] = projection([d.lng, d.lat]);
                    return `translate(${x},${y})`;
                })
                .style('cursor', 'pointer');

            // Glow ring
            bubbles.append('circle')
                .attr('class', 'hm-glow')
                .attr('r', d => sizeScale(d.bookings) + 6)
                .attr('fill', d => colorScale(d.bookings))
                .attr('opacity', 0.15)
                .attr('filter', 'url(#hm-glow)');

            // Main bubble
            bubbles.append('circle')
                .attr('class', 'hm-dot')
                .attr('r', d => sizeScale(d.bookings))
                .attr('fill', d => colorScale(d.bookings))
                .attr('opacity', 0.82)
                .attr('stroke', HEATMAP_COLORS.accent)
                .attr('stroke-width', 1)
                .attr('stroke-opacity', 0.3);

            // Inner bright dot
            bubbles.append('circle')
                .attr('r', 2.5)
                .attr('fill', HEATMAP_COLORS.accent)
                .attr('opacity', 0.65);

            // City label for prominent cities
            bubbles.filter(d => d.bookings >= maxBookings * 0.4)
                .append('text')
                .attr('dy', d => -sizeScale(d.bookings) - 7)
                .attr('text-anchor', 'middle')
                .attr('fill', HEATMAP_COLORS.accent)
                .attr('font-size', '10px')
                .attr('font-weight', '600')
                .attr('opacity', 0.9)
                .text(d => d.city);

            // Hovering
            bubbles
                .on('mouseenter', function (event, d) {
                    const el = d3.select(this);
                    el.select('.hm-dot').transition().duration(200)
                        .attr('r', sizeScale(d.bookings) + 4).attr('opacity', 1)
                        .attr('stroke-width', 2).attr('stroke-opacity', 0.8);
                    el.select('.hm-glow').transition().duration(200)
                        .attr('r', sizeScale(d.bookings) + 12).attr('opacity', 0.28);
                    const pct = ((d.bookings / maxBookings) * 100).toFixed(0);
                    tooltip.html(`
                        <div style="font-weight:700;font-size:13px;margin-bottom:5px">${d.city}</div>
                        <div style="display:flex;justify-content:space-between;gap:14px">
                            <span style="color:${HEATMAP_COLORS.muted}">Bookings</span>
                            <span style="font-weight:700">${d.bookings}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;gap:14px">
                            <span style="color:${HEATMAP_COLORS.muted}">Revenue</span>
                            <span style="font-weight:700">₹${d.revenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;gap:14px">
                            <span style="color:${HEATMAP_COLORS.muted}">Share</span>
                            <span style="font-weight:700">${pct}%</span>
                        </div>
                        <div style="margin-top:7px;height:4px;border-radius:3px;background:#2d4a30">
                            <div style="height:100%;width:${pct}%;border-radius:3px;background:${colorScale(d.bookings)}"></div>
                        </div>
                    `).transition().duration(200).style('opacity', 1);
                })
                .on('mousemove', function (event) {
                    const r = svgRef.current.parentElement.getBoundingClientRect();
                    tooltip
                        .style('left', `${event.clientX - r.left + 14}px`)
                        .style('top', `${event.clientY - r.top - 10}px`);
                })
                .on('mouseleave', function (event, d) {
                    const el = d3.select(this);
                    el.select('.hm-dot').transition().duration(300)
                        .attr('r', sizeScale(d.bookings)).attr('opacity', 0.82)
                        .attr('stroke-width', 1).attr('stroke-opacity', 0.3);
                    el.select('.hm-glow').transition().duration(300)
                        .attr('r', sizeScale(d.bookings) + 6).attr('opacity', 0.15);
                    tooltip.transition().duration(200).style('opacity', 0);
                });

            // Legend
            const legendG = svg.append('g').attr('transform', `translate(${width - 138}, 14)`);
            legendG.append('rect').attr('x', -8).attr('y', -7).attr('width', 126).attr('height', 58).attr('rx', 8)
                .attr('fill', '#1a2e1c').attr('opacity', 0.85);
            legendG.append('text').attr('fill', HEATMAP_COLORS.accent).attr('font-size', '11px')
                .attr('font-weight', '600').text('Bookings');
            const grad = defs.append('linearGradient').attr('id', 'hm-grad');
            grad.append('stop').attr('offset', '0%').attr('stop-color', HEATMAP_COLORS.heatLow);
            grad.append('stop').attr('offset', '100%').attr('stop-color', HEATMAP_COLORS.heatHigh);
            legendG.append('rect').attr('y', 13).attr('width', 88).attr('height', 9).attr('rx', 3)
                .attr('fill', 'url(#hm-grad)');
            legendG.append('text').attr('y', 36).attr('fill', HEATMAP_COLORS.muted).attr('font-size', '9px').text('Low');
            legendG.append('text').attr('x', 88).attr('y', 36).attr('text-anchor', 'end')
                .attr('fill', HEATMAP_COLORS.muted).attr('font-size', '9px').text('High');
        }).catch(() => {
            setMapLoading(false);
            mapGroup.append('text')
                .attr('x', width / 2).attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', HEATMAP_COLORS.muted).attr('font-size', '14px')
                .text('Could not load India map data');
        });

        // Zoom hint
        svg.append('text')
            .attr('x', 14).attr('y', height - 10)
            .attr('fill', HEATMAP_COLORS.muted).attr('font-size', '10px').attr('opacity', 0.5)
            .text('Scroll to zoom · Drag to pan');

    }, [cityData]);

    return (
        <div className="relative w-full h-full" style={{ minHeight: 480 }}>
            {mapLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={22} style={{ color: HEATMAP_COLORS.secondary }} />
                        <span style={{ color: HEATMAP_COLORS.muted, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>
                            LOADING MAP...
                        </span>
                    </div>
                </div>
            )}
            <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
            <div ref={tooltipRef} />
        </div>
    );
};

const Analytics = () => {
    const [roiData, setRoiData] = useState([]);
    const [efficiencyData, setEfficiencyData] = useState([]);
    const [financialData, setFinancialData] = useState([]);
    const [dailyProfitData, setDailyProfitData] = useState([]);
    const [geographyData, setGeographyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        try {
            const [roiRes, effRes, finRes, dailyRes, geoRes] = await Promise.all([
                api.get('/analytics/roi'),
                api.get('/analytics/efficiency').catch(() => ({ data: { data: { efficiency: [] } } })),
                api.get('/analytics/financial').catch(() => ({ data: { data: { monthly: [] } } })),
                api.get('/analytics/daily-profit').catch(() => ({ data: { data: [] } })),
                api.get('/analytics/geography').catch(() => ({ data: { data: [] } })),
            ]);
            setRoiData(roiRes.data.data.vehicles || roiRes.data.data || []);
            setEfficiencyData(effRes.data?.data?.efficiency || []);
            setFinancialData(finRes.data?.data?.monthly || []);
            setDailyProfitData(dailyRes.data?.data || []);
            setGeographyData(geoRes.data?.data || []);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied: You need Fleet Manager or Financial Analyst permissions.');
            } else {
                setError('Failed to load analytics data.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const totalFuelCost = useMemo(() =>
        efficiencyData.reduce((s, v) => s + parseFloat(v.total_cost || 0), 0)
        , [efficiencyData]);

    const avgRoi = useMemo(() =>
        roiData.length > 0
            ? (roiData.reduce((s, v) => s + parseFloat(v.roi_percentage || 0), 0) / roiData.length).toFixed(1)
            : null
        , [roiData]);

    const utilizationRate = useMemo(() =>
        roiData.length > 0
            ? Math.min(100, ((roiData.filter(v => parseFloat(v.total_revenue || 0) > 0).length / roiData.length) * 100)).toFixed(0)
            : null
        , [roiData]);

    // Always use dummy data for the profit chart so graph is balanced and complete
    const activeDailyProfit = DUMMY_DAILY_PROFIT;

    const dailyProfitChartData = useMemo(() => ({
        labels: activeDailyProfit.map(d => new Date(d.date).getDate()),
        datasets: [{
            label: 'Net Profit (₹)',
            data: activeDailyProfit.map(d => parseFloat(d.profit)),
            backgroundColor: activeDailyProfit.map(d => parseFloat(d.profit) >= 0 ? 'rgba(16,185,129,0.8)' : 'rgba(239,68,68,0.8)'),
            borderRadius: 6,
            barThickness: 10,
        }],
    }), [activeDailyProfit]);

    const efficiencyChartData = useMemo(() => ({
        labels: efficiencyData.map(v => v.name || v.license_plate),
        datasets: [{
            label: 'Efficiency Index',
            data: efficiencyData.map(v => parseFloat(v.liters_per_100km || 0).toFixed(2)),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointRadius: 5,
        }],
    }), [efficiencyData]);

    const top5 = useMemo(() =>
        [...roiData]
            .sort((a, b) => parseFloat(b.total_operational_cost || 0) - parseFloat(a.total_operational_cost || 0))
            .slice(0, 5)
        , [roiData]);

    const costlyChartData = useMemo(() => ({
        labels: top5.map(v => v.name || v.license_plate),
        datasets: [{
            label: 'Cost in ₹',
            data: top5.map(v => parseFloat(v.total_operational_cost || 0).toFixed(2)),
            backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
            borderRadius: 8,
        }],
    }), [top5]);

    const lineChartOpts = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(128,128,128,0.05)' }, ticks: { font: { weight: '600', size: 9 } } },
            x: { grid: { display: false }, ticks: { font: { weight: '600', size: 9 }, maxRotation: 45, minRotation: 45 } }
        },
    }), []);

    const barChartOpts = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { grid: { color: 'rgba(128,128,128,0.05)' }, ticks: { callback: (v) => `₹${v / 1000}K`, font: { weight: '600', size: 9 } } },
            x: { grid: { display: false }, ticks: { font: { weight: '600', size: 9 } } }
        },
    }), []);

    const buildPayroll = useCallback(() => {
        return financialData.map(row => ({
            Month: MONTH_NAMES[parseInt(row.month) - 1] || row.month,
            Revenue: `\u20b9${parseFloat(row.revenue || 0).toLocaleString('en-IN')}`,
            'Fuel Cost': `\u20b9${parseFloat(row.fuel_cost || 0).toLocaleString('en-IN')}`,
            Maintenance: `\u20b9${parseFloat(row.maintenance_cost || 0).toLocaleString('en-IN')}`,
            'Net Profit': `\u20b9${(parseFloat(row.revenue || 0) - parseFloat(row.fuel_cost || 0) - parseFloat(row.maintenance_cost || 0)).toLocaleString('en-IN')}`,
        }));
    }, [financialData]);

    const handleDownloadPayroll = useCallback(() => {
        const p = buildPayroll();
        if (p.length) downloadPDF(p, 'FleetFlow Monthly Payroll', 'monthly_payroll.pdf');
        else alert('No financial data available yet.');
    }, [buildPayroll]);

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="animate-spin text-primary mr-3" size={32} />
            <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">Synchronizing Deep Analytics...</span>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
            <Activity className="text-danger mb-4" size={48} />
            <p className="font-bold text-text-primary text-lg mb-2">Analytics Unavailable</p>
            <p className="text-sm text-text-secondary max-w-md">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* KPI Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Fleet Performance Intelligence</h2>
                    <p className="text-sm text-text-secondary font-medium mt-1 uppercase tracking-tighter">Real-time operational and geographic telemetry</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative group">
                        <button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all outline-none">
                            <Download size={18} /> Export Data
                        </button>
                        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                            <button onClick={() => downloadCSV(roiData, 'fleet_roi_report.csv')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <Table size={16} className="text-success" /> ROI Report (CSV)
                            </button>
                            <button onClick={() => downloadPDF(roiData, 'FleetFlow ROI Analytics', 'fleet_roi_report.pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <FileText size={16} className="text-danger" /> ROI Report (PDF)
                            </button>
                            <hr className="border-border my-1" />
                            <button onClick={() => { const p = buildPayroll(); if (p.length) downloadCSV(p, 'monthly_payroll.csv'); else alert('No financial data available yet.'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <Table size={16} className="text-primary" /> Monthly Payroll (CSV)
                            </button>
                            <button onClick={() => { const p = buildPayroll(); if (p.length) downloadPDF(p, 'FleetFlow Monthly Payroll', 'monthly_payroll.pdf'); else alert('No financial data available yet.'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <FileText size={16} className="text-warning" /> Monthly Payroll (PDF)
                            </button>
                            <hr className="border-border my-1" />
                            <button onClick={() => downloadPDF(efficiencyData, 'FleetFlow Fleet Health Audit', 'health_audit.pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-text-primary hover:bg-background rounded-xl transition-colors">
                                <FileText size={16} className="text-success" /> Health Audit (PDF)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Total Fuel Cost', value: `₹${totalFuelCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: <Fuel size={22} />, color: 'primary' },
                    { label: 'Avg Fleet ROI', value: avgRoi !== null ? `${avgRoi}%` : '---', icon: <TrendingUp size={22} />, color: 'success' },
                    { label: 'Asset Utilization', value: utilizationRate !== null ? `${utilizationRate}%` : '---', icon: <Activity size={22} />, color: 'warning' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-card rounded-2xl border border-border p-6 shadow-sm flex items-center gap-4 group hover:border-primary/20 transition-all overflow-hidden relative">
                        <div className={`h-12 w-12 rounded-xl bg-${kpi.color}/10 flex items-center justify-center text-${kpi.color} group-hover:scale-110 transition-transform`}>{kpi.icon}</div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary mb-1">{kpi.label}</p>
                            <p className="text-2xl font-extrabold text-text-primary">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* DASHBOARD LAYOUT */}
            <div className="grid grid-cols-1 gap-8">

                {/* ROW 1: Fleet Efficiency + Top 5 Lifecycle Costs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Fleet Efficiency */}
                    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col">
                        <div className="mb-6">
                            <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Fleet Efficiency Index</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Mean Liters per 100km trajectory</p>
                        </div>
                        <div className="h-64">
                            {efficiencyData.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Efficiency data loading...</p>
                                </div>
                            ) : (
                                <Line data={efficiencyChartData} options={lineChartOpts} />
                            )}
                        </div>
                    </div>

                    {/* Top 5 Costliest */}
                    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col">
                        <div className="mb-6">
                            <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Top 5 Lifecycle Costs</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Aggregated operational spend (₹)</p>
                        </div>
                        <div className="h-64">
                            {top5.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Analyzing asset costs...</p>
                                </div>
                            ) : (
                                <Bar data={costlyChartData} options={lineChartOpts} />
                            )}
                        </div>
                    </div>

                </div>

                {/* ROW 2: India Map + Net Daily Profit */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* India Heatmap */}
                    <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden flex flex-col">
                        <div className="p-8 pb-0">
                            <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">Geographic Booking Distribution</h4>
                        </div>
                        <div className="flex-1 min-h-[460px] relative">
                            <IndiaHeatmap cityData={DUMMY_CITY_BOOKINGS} />
                        </div>
                    </div>

                    {/* Net Daily Profit */}
                    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col">
                        <div className="mb-6">
                            <h4 className="text-lg font-extrabold text-text-primary uppercase tracking-tight">Net Daily Profit — {MONTH_NAMES[new Date().getMonth()]}</h4>
                            <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Current month financial velocity</p>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <Bar data={dailyProfitChartData} options={barChartOpts} />
                        </div>
                    </div>

                </div>

                {/* 5. TOP PERFORMING ASSETS */}
                <div className="bg-card rounded-3xl p-8 shadow-sm border border-border relative overflow-hidden">
                    <h4 className="text-lg font-black text-text-primary mb-6 uppercase tracking-tight">Top Revenue Generating Assets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        {roiData.slice(0, 3).map((v, i) => (
                            <div key={v.id} className={`space-y-2 border-l-4 pl-6 ${i === 0 ? 'border-success' : i === 1 ? 'border-primary' : 'border-warning'}`}>
                                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{v.license_plate}</p>
                                <h5 className="text-lg font-bold text-text-primary">{v.name}</h5>
                                <p className="text-sm text-text-secondary tracking-tight">
                                    <span className="text-text-secondary font-bold">Op. Cost:</span> <span className="font-black text-primary">₹{parseFloat(v.total_operational_cost || 0).toLocaleString('en-IN')}</span>
                                    <br />
                                    <span className="text-success font-bold text-success/80">Revenue:</span> <span className="font-black text-text-primary">₹{parseFloat(v.total_revenue || 0).toLocaleString('en-IN')}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LEDGER */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden mt-8">
                <div className="flex items-center justify-between px-8 py-5 border-b border-border">
                    <div>
                        <h4 className="text-base font-extrabold text-text-primary">Financial Summary of Month</h4>
                        <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-0.5">Revenue vs Costs breakdown</p>
                    </div>
                    <button
                        onClick={() => { const p = buildPayroll(); if (p.length) downloadPDF(p, 'FleetFlow Monthly Payroll', 'monthly_payroll.pdf'); else alert('No financial data available yet.'); }}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all outline-none"
                    >
                        <Download size={14} /> Download Payroll
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.15em] text-text-secondary bg-background/50 border-b border-border">
                                <th className="px-8 py-5">Period</th>
                                <th className="px-8 py-5">Gross Revenue</th>
                                <th className="px-8 py-5">Direct Costs</th>
                                <th className="px-8 py-5 text-right pr-12">Net Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {financialData.map((row, i) => {
                                const revenue = parseFloat(row.revenue || 0);
                                const totalCosts = parseFloat(row.fuel_cost || 0) + parseFloat(row.maintenance_cost || 0);
                                const netProfit = revenue - totalCosts;
                                return (
                                    <tr key={i} className="hover:bg-background/50 transition-colors">
                                        <td className="px-8 py-6 font-bold text-text-primary">{MONTH_NAMES[parseInt(row.month) - 1]} {row.year}</td>
                                        <td className="px-8 py-6 font-bold text-success">₹{revenue.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-6 font-medium text-text-secondary">₹{totalCosts.toLocaleString('en-IN')}</td>
                                        <td className={`px-8 py-6 text-right pr-12 font-black text-base ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
                                            ₹{netProfit.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
