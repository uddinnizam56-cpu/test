import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Navigation,
  Clock,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Star,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { PickupOrder, Language } from '../../types';
import { translations } from '../../utils/translations';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveGpsTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  order: PickupOrder;
}

export const LiveGpsTrackerModal: React.FC<LiveGpsTrackerModalProps> = ({
  isOpen,
  onClose,
  language,
  order,
}) => {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
  const [simulatedEtaMinutes, setSimulatedEtaMinutes] = useState<number>(12);
  const [driverLat, setDriverLat] = useState<number>(
    order.executiveLat || order.address.lat - 0.008
  );
  const [driverLng, setDriverLng] = useState<number>(
    order.executiveLng || order.address.lng - 0.006
  );
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<string[]>([
    'Executive: Hello! I am on my way in my Electric Auto.',
  ]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current).setView(
        [order.address.lat, order.address.lng],
        14
      );

      const tileLayer = L.tileLayer(
        mapView === 'standard'
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: mapView === 'standard' 
            ? '&copy; OpenStreetMap contributors' 
            : 'Tiles &copy; Esri',
        }
      ).addTo(map);
      tileLayerRef.current = tileLayer;

      // Customer Location Icon
      const customerIcon = L.divIcon({
        className: 'custom-customer-pin',
        html: `<div style="background-color: #059669; color: white; border-radius: 50%; padding: 8px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold;">📍</div>`,
        iconSize: [36, 36],
      });

      L.marker([order.address.lat, order.address.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>${order.customerName}'s Address</b><br/>${order.address.street}`);

      // Driver Vehicle Icon
      const driverIcon = L.divIcon({
        className: 'custom-driver-pin',
        html: `<div style="background-color: #10b981; color: white; border-radius: 12px; padding: 6px 10px; border: 2px solid white; font-size: 11px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; items-center: center; gap: 4px;">🛺 ${order.vehicleNo || 'KA-01-EV'}</div>`,
        iconSize: [100, 36],
      });

      const driverMarker = L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(
        map
      );
      driverMarkerRef.current = driverMarker;

      // Draw Route Polyline
      const routePoints: [number, number][] = [
        [driverLat, driverLng],
        [
          driverLat + (order.address.lat - driverLat) * 0.5,
          driverLng + (order.address.lng - driverLng) * 0.5,
        ],
        [order.address.lat, order.address.lng],
      ];

      L.polyline(routePoints, {
        color: '#059669',
        weight: 5,
        dashArray: '8, 8',
      }).addTo(map);

      leafletInstance.current = map;
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [isOpen, order.address.lat, order.address.lng, order.customerName, order.vehicleNo]);

  // Simulate Live Movement along GPS route
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setDriverLat((prevLat) => {
        const diff = order.address.lat - prevLat;
        if (Math.abs(diff) < 0.0002) return prevLat;
        return prevLat + diff * 0.05;
      });

      setDriverLng((prevLng) => {
        const diff = order.address.lng - prevLng;
        if (Math.abs(diff) < 0.0002) return prevLng;
        return prevLng + diff * 0.05;
      });

      setSimulatedEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, order.address.lat, order.address.lng]);

  // Update marker position on map when coordinates change
  useEffect(() => {
    if (!isOpen) return;
    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([driverLat, driverLng]);
    }
  }, [isOpen, driverLat, driverLng]);

  // Update map layer when mapView changes
  useEffect(() => {
    if (!leafletInstance.current || !tileLayerRef.current) return;
    
    leafletInstance.current.removeLayer(tileLayerRef.current);
    
    const newTileLayer = L.tileLayer(
      mapView === 'standard'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: mapView === 'standard' 
          ? '&copy; OpenStreetMap contributors' 
          : 'Tiles &copy; Esri',
      }
    ).addTo(leafletInstance.current);

    tileLayerRef.current = newTileLayer;
  }, [mapView]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setChatHistory((prev) => [
      ...prev,
      `You: ${chatMessage}`,
      'Executive: Got it! Reaching in 5 minutes.',
    ]);
    setChatMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all shadow-2xs border border-slate-200 cursor-pointer"
            title="Go Back to Orders"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>← Back to Orders</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            title="Close tracking window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
              <span>{t.trackingTitle}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                LIVE GPS
              </span>
            </h2>
            <p className="text-xs text-slate-500">Order #{order.orderNumber}</p>
          </div>
        </div>

        {/* Live Status Progress Steps */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 mb-2">
            <span>Status: En Route to Doorstep</span>
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5" />
              ETA: ~{simulatedEtaMinutes} Mins
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 relative">
            <div className="bg-emerald-600 h-2 rounded-full" />
            <div className="bg-emerald-600 h-2 rounded-full animate-pulse" />
            <div className="bg-slate-200 h-2 rounded-full" />
            <div className="bg-slate-200 h-2 rounded-full" />
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-1">
            <span>Assigned</span>
            <span className="text-emerald-700 font-bold">En Route</span>
            <span>Arrived</span>
            <span>Payout</span>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner mb-4 relative z-0">
          <div ref={mapRef} className="w-full h-full" />
          
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200/50 overflow-hidden flex text-[10px] font-extrabold p-0.5">
            <button
              onClick={() => setMapView('standard')}
              className={`px-3 py-1.5 rounded-md transition-all ${mapView === 'standard' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
            >
              Standard
            </button>
            <button
              onClick={() => setMapView('satellite')}
              className={`px-3 py-1.5 rounded-md transition-all ${mapView === 'satellite' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}
            >
              Satellite
            </button>
          </div>
        </div>

        {/* Executive Profile & Direct Phone Call / Chat Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 border-2 border-emerald-500">
              <img
                src={order.assignedExecutiveName ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250' : ''}
                alt="Executive"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {order.assignedExecutiveName || 'Manjunath Gowda'}
                </h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {order.vehicleNo || 'KA-01-EV-4820'} (Electric Auto)
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>4.9 (340+ Ratings)</span>
              </div>
            </div>

            <a
              href={`tel:${order.assignedExecutivePhone || '+919845122301'}`}
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all shrink-0"
              title="Call Executive"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Chat / Direct Message Simulation */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-1 mb-2 max-h-20 overflow-y-auto text-xs">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className="p-1.5 rounded-lg bg-white border border-slate-100 text-slate-700">
                  {msg}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send quick note to executive..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Modal Bottom Action Bar with Back Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-all cursor-pointer border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Back to Order History</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done Tracking</span>
          </button>
        </div>
      </div>
    </div>
  );
};
