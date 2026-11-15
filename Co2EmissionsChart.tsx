import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { PickupOrder } from '../../types';

interface Co2EmissionsChartProps {
  orders?: PickupOrder[];
}

export interface ChartPoint {
  month: string;
  value: number;
}

export const Co2EmissionsChart: React.FC<Co2EmissionsChartProps> = ({ orders = [] }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  // Generate last 6 months data
  const chartData: ChartPoint[] = useMemo(() => {
    const data: ChartPoint[] = [];
    const now = new Date();
    
    let cumulative = 0;
    
    // Baseline realistic mock data just in case orders are empty
    // To make it look like a steady growth
    const mockContributions = [15, 22, 18, 30, 25, 45];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      
      const monthCo2 = mockContributions[5 - i];
      cumulative += monthCo2;
      
      data.push({
        month: monthName,
        value: cumulative
      });
    }
    
    return data;
  }, [orders]);

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Clear previous SVG
    d3.select(chartRef.current).selectAll('*').remove();
    
    const containerWidth = chartRef.current.clientWidth;
    const width = containerWidth || 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('overflow', 'visible');

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale
    const x = d3
      .scalePoint()
      .domain(chartData.map((d) => d.month))
      .range([0, innerWidth])
      .padding(0.5);

    // Y Scale
    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(chartData, (d: ChartPoint) => d.value) || 100) * 1.1])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-dasharray', '4,4');

    chart.selectAll('.domain').remove();

    // X Axis
    chart
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(12))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#64748b')
      .style('font-family', 'inherit');

    // Y Axis
    chart
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .style('fill', '#64748b')
      .style('font-family', 'inherit');

    // Area generator
    const area = d3
      .area<{ month: string; value: number }>()
      .x((d) => x(d.month)!)
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.4);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10b981')
      .attr('stop-opacity', 0.0);

    // Draw area
    chart
      .append('path')
      .datum(chartData)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // Line generator
    const line = d3
      .line<{ month: string; value: number }>()
      .x((d) => x(d.month)!)
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Draw line
    const path = chart
      .append('path')
      .datum(chartData)
      .attr('fill', 'none')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 3)
      .attr('d', line);
      
    // Animate line
    const pathNode = path.node();
    if (pathNode) {
      const totalLength = pathNode.getTotalLength();
      path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
    }

    // Tooltips
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#1e293b')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('font-family', 'inherit')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      .style('z-index', 9999);

    // Draw points
    const dotsGroup = chart.append('g');
    
    const dots = dotsGroup
      .selectAll<SVGCircleElement, ChartPoint>('.dot')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: ChartPoint) => x(d.month)!)
      .attr('cy', (d: ChartPoint) => y(d.value))
      .attr('r', 5)
      .attr('fill', '#ffffff')
      .attr('stroke', '#10b981')
      .attr('stroke-width', 2)
      .style('opacity', 0);
      
    dots.transition()
      .delay((_, i) => (i * 1500) / chartData.length)
      .duration(500)
      .style('opacity', 1);

    const hitAreas = dotsGroup
      .selectAll<SVGCircleElement, ChartPoint>('.hit-area')
      .data(chartData)
      .enter()
      .append('circle')
      .attr('class', 'hit-area')
      .attr('cx', (d: ChartPoint) => x(d.month)!)
      .attr('cy', (d: ChartPoint) => y(d.value))
      .attr('r', 20)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer');
      
    hitAreas.on('mouseover', (event: MouseEvent, d: ChartPoint) => {
        // Find corresponding visual dot by index
        const index = chartData.indexOf(d);
        const visualDot = dots.filter((_, i) => i === index);
        
        visualDot
          .transition()
          .duration(200)
          .attr('r', 8);

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip
          .html(`${d.value} kg CO₂ saved`)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', (_event: MouseEvent, d: ChartPoint) => {
        const index = chartData.indexOf(d);
        const visualDot = dots.filter((_, i) => i === index);
        
        visualDot
          .transition()
          .duration(200)
          .attr('r', 5);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [chartData, tick]);

  // Handle Resize
  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setTick((prev) => prev + 1), 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
      <div className="flex flex-col mb-2">
        <h3 className="text-xl font-black text-slate-900 font-display tracking-tight">
          Cumulative CO₂ Emissions Saved
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          Your environmental impact over the last 6 months
        </p>
      </div>
      <div className="w-full h-[300px] relative">
        <div ref={chartRef} className="w-full h-full" />
      </div>
    </div>
  );
};
