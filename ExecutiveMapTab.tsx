import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Navigation,
  Truck,
  Phone,
  CheckCircle2,
  Clock,
  Layers,
  LocateFixed,
  Maximize2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PickupOrder, Language } from '../../types';
import { translations } from '../../utils/translations';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ExecutiveMapTabProps {
  orders: PickupOrder[];
  activeJob: PickupOrder | null;
  onSelectJob: (job: PickupOrder) => void;
  language: Language;
}

export const ExecutiveMapTab: React.FC<ExecutiveMapTabProps> = ({
  orders,
  activeJob,
  onSelectJob,
  language,
}) => {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [selectedOrderOnMap, setSelectedOrderOnMap] = useState<PickupOrder | null>(activeJob);

  // Executive vehicle current location (Bengaluru hub reference)
  const execLat = activeJob?.executiveLat || 12.968;
  const execLng = activeJob?.executiveLng || 77.589;

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'active') return o.status === 'assigned' || o.status === 'en_route' || o.status === 'arrived' || o.status === 'weighing';
    if (filterStatus === 'completed') return o.status === 'completed';
    return true;
  });

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current).setView([12.9716, 77.5946], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      leafletMapRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Add Executive EV Marker
    const execIcon = L.divIcon({
      className: 'custom-exec-pin',
      html: `<div style="background: #0f172a; color: #34d399; border: 2px solid #34d399; border-radius: 12px; padding: 6px 10px; font-weight: 900; font-size: 11px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px; white-space: nowrap;">⚡🛺 EV Auto (Manjunath)</div>`,
      iconSize: [140, 36],
    });

    const execMarker = L.marker([execLat, execLng], { icon: execIcon }).addTo(markersGroup);
    execMarker.bindPopup(`<b>Executive Vehicle</b><br/>KA-01-EV-4820 (Electric Auto)`);
    bounds.push([execLat, execLng]);

    // Plot Order Markers
    filteredOrders.forEach((ord) => {
      const isSelected = activeJob?.id === ord.id;
      const isCompleted = ord.status === 'completed';

      const pinBg = isSelected ? '#059669' : isCompleted ? '#64748b' : '#d97706';
      const statusLabel = ord.status.toUpperCase();

      const orderIcon = L.divIcon({
        className: 'custom-order-pin',
        html: `<div style="background: ${pinBg}; color: white; border-radius: 10px; padding: 4px 8px; font-weight: 800; font-size: 10px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; white-space: nowrap;">
          <span>📦 #${ord.orderNumber}</span>
          <span style="font-size: 8px; opacity: 0.9;">${ord.customerName}</span>
        </div>`,
        iconSize: [110, 38],
      });

      const marker = L.marker([ord.address.lat, ord.address.lng], { icon: orderIcon }).addTo(markersGroup);
      bounds.push([ord.address.lat, ord.address.lng]);

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 220px;">
          <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">Order #${ord.orderNumber}</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${ord.customerName}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">📍 ${ord.address.street}, ${ord.address.area}</div>
          <div style="font-size: 11px; font-weight: 700; color: #059669; margin-top: 4px;">Estimated Payout: ₹${ord.totalEstimatedAmount}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Scheduled: ${ord.timeSlot}</div>
          <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <button id="btn-select-${ord.id}" style="width: 100%; background: #059669; color: white; border: none; padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer;">
              Select Active Pickup Target
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setSelectedOrderOnMap(ord);
        setTimeout(() => {
          const btn = document.getElementById(`btn-select-${ord.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectJob(ord);
              marker.closePopup();
            };
          }
        }, 50);
      });
    });

    // Draw route line to active target if selected
    if (activeJob && activeJob.status !== 'completed') {
      const routeCoords: [number, number][] = [
        [execLat, execLng],
        [
          execLat + (activeJob.address.lat - execLat) * 0.5,
          execLng + (activeJob.address.lng - execLng) * 0.5,
        ],
        [activeJob.address.lat, activeJob.address.lng],
      ];

      L.polyline(routeCoords, {
        color: '#10b981',
        weight: 4,
        dashArray: '6, 8',
      }).addTo(markersGroup);
    }

    // Fit bounds if markers exist
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [filteredOrders, activeJob, execLat, execLng, onSelectJob]);

  const handleCenterVehicle = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([execLat, execLng], 14, { animate: true });
    }
  };

  const handleCenterActiveTarget = () => {
    if (leafletMapRef.current && activeJob) {
      leafletMapRef.current.setView([activeJob.address.lat, activeJob.address.lng], 15, { animate: true });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Control Header */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 font-display flex items-center gap-2">
              <span>Interactive Real-Time Fleet Map</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                {filteredOrders.length} Pins Plotted
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Karnataka Field Operations • Bangalore Urban District
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Active Pickups
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Locations
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 min-h-[460px]">
          <div ref={mapRef} className="w-full h-[460px] z-0" />

          {/* Floating Map Quick Actions */}
          <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
            <button
              onClick={handleCenterVehicle}
              className="px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 border border-slate-700"
              title="Center on Executive Vehicle"
            >
              <LocateFixed className="w-4 h-4 text-emerald-400" />
              <span>Center Driver EV</span>
            </button>

            {activeJob && (
              <button
                onClick={handleCenterActiveTarget}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 border border-emerald-400/40"
              >
                <MapPin className="w-4 h-4 text-emerald-200" />
                <span>Target: #{activeJob.orderNumber}</span>
              </button>
            )}
          </div>

          {/* Map Legend Footer */}
          <div className="absolute bottom-3 left-3 right-3 z-[400] p-2.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-between text-[11px] font-bold text-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-900 border border-emerald-400 inline-block" />
                <span>Executive Auto</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
                <span>Active Target</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>Assigned Pickup</span>
              </span>
            </div>
            <span className="text-slate-500 hidden sm:inline">Click pins to inspect or select pickup</span>
          </div>
        </div>

        {/* Sidebar: Location List & Quick Target Switcher */}
        <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs max-h-[460px] overflow-y-auto">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Pickup Route List</span>
            <span className="text-emerald-700 font-bold">{filteredOrders.length} Locations</span>
          </h4>

          <div className="space-y-2.5">
            {filteredOrders.map((ord) => {
              const isSelected = activeJob?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => onSelectJob(ord)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-xs text-slate-900 font-display flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>#{ord.orderNumber}</span>
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        ord.status === 'completed'
                          ? 'bg-slate-200 text-slate-700'
                          : isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900">{ord.customerName}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{ord.address.street}, {ord.address.area}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-emerald-700 font-display">
                      Est: ₹{ord.totalEstimatedAmount}
                    </span>

                    <a
                      href={`tel:${ord.customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
