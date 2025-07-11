import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

const TokenChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  console.log('📊 New chart data:', data);

  useEffect(() => {
    if (!data?.length) return;

    // Clear previous chart (important!)
    if (chartRef.current) {
      chartRef.current.innerHTML = '';
    }

    // Create chart
    chartInstance.current = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 460,
      layout: { background: { color: '#111827' }, textColor: '#e5e7eb' },
      grid: {
        vertLines: { color: '#2d3748' },
        horzLines: { color: '#2d3748' },
      },
      timeScale: { timeVisible: true, secondsVisible: false },
    });

    const candleSeries = chartInstance.current.addCandlestickSeries({
      upColor: '#15d175',
      downColor: '#ff4d4d',
      borderVisible: false,
      wickUpColor: '#15d175',
      wickDownColor: '#ff4d4d',
    });

    candleSeries.setData(data);

    // Resize handler
    const handleResize = () => {
      chartInstance.current?.applyOptions({ width: chartRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.remove();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full" />;
};

export default TokenChart;
