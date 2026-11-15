import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Truck,
  Users,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Layers,
  Sparkles,
  ArrowLeft,
  X,
  Search,
  CheckCircle2,
  Calendar,
  Filter,
} from 'lucide-react';
import { Language, CleanupDrive, UserProfile } from '../../types';
import { translations } from '../../utils/translations';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface InteractiveEcoMapProps {
  language: Language;
  userProfile: UserProfile;
  cleanupDrives?: CleanupDrive[];
  onBookPickupHere?: (area: string) => void;
  onBack?: () => void;
}

interface EcoLocation {
  id: string;
  name: string;
  type: 'hub' | 'truck' | 'drive';
  categoryTitle: string;
  lat: number;
  lng: number;
  area: string;
  address: string;
  timings: string;
  contactPhone: string;
  managerName: string;
  acceptedMaterials: string[];
  vehicleNo?: string;
  batteryStatus?: string;
  driveDate?: string;
}

const COLLECTION_HUBS: EcoLocation[] = [
  {
    id: 'hub_indiranagar',
    name: 'Indiranagar BDA Eco Sorting Facility',
    type: 'hub',
    categoryTitle: 'Primary Material Recovery Facility (MRF)',
    lat: 12.9716,
    lng: 77.6412,
    area: 'Indiranagar',
    address: 'Near Indiranagar BDA Complex, 100ft Road, Bengaluru 560038',
    timings: '07:30 AM - 07:30 PM (Daily)',
    contactPhone: '+91 80 2525 9901',
    managerName: 'Satish Hegde (Hub Supervisor)',
    acceptedMaterials: ['Newspaper & Books', 'Corrugated Cardboard', 'Aluminium & Copper', 'E-Waste', 'Glass Bottles'],
  },
  {
    id: 'hub_peenya',
    name: 'Peenya Industrial Zero-Waste Sorting Yard',
    type: 'hub',
    categoryTitle: 'Heavy Scrap & Metal Processing Yard',
    lat: 13.0285,
    lng: 77.5195,
    area: 'Peenya',
    address: 'Plot 48, 2nd Phase Industrial Estate, Peenya, Bengaluru 560058',
    timings: '08:00 AM - 08:00 PM (Mon-Sat)',
    contactPhone: '+91 80 2839 4410',
    managerName: 'Naveen Kumar (Plant Head)',
    acceptedMaterials: ['Industrial Iron & Steel', 'Brass & Bronze', 'Lead Batteries', 'Heavy Appliances', 'Pallets & Crates'],
  },
  {
    id: 'hub_koramangala',
    name: 'Koramangala BBMP Dry Waste Center',
    type: 'hub',
    categoryTitle: 'Community Segregation & Kiosk',
    lat: 12.9352,
    lng: 77.6245,
    area: 'Koramangala',
    address: '80 Feet Road, 6th Block, Koramangala, Bengaluru 560095',
    timings: '07:00 AM - 06:30 PM (Daily)',
    contactPhone: '+91 80 2553 7180',
    managerName: 'Anita Krishnan',
    acceptedMaterials: ['Plastics & Pet Bottles', 'Paper Waste', 'Iron Grills', 'Small Home Gadgets'],
  },
  {
    id: 'hub_whitefield',
    name: 'Whitefield ITPL E-Waste & Tech Depot',
    type: 'hub',
    categoryTitle: 'Authorized E-Waste & Corporate Hub',
    lat: 12.9863,
    lng: 77.7308,
    area: 'Whitefield',
    address: 'EPIP Industrial Area, Whitefield, Bengaluru 560066',
    timings: '09:00 AM - 07:00 PM (Daily)',
    contactPhone: '+91 80 2841 0567',
    managerName: 'Kishore Varma',
    acceptedMaterials: ['Laptops & Desktops', 'Telecom Cables', 'Smartphones', 'Lithium Batteries', 'Printed Circuit Boards (PCBs)'],
  },
  {
    id: 'hub_jayanagar',
    name: 'Jayanagar 4th Block Green Drop Kiosk',
    type: 'hub',
    categoryTitle: 'Smart Citizen Drop-Off Kiosk',
    lat: 12.9299,
    lng: 77.5824,
    area: 'Jayanagar',
    address: 'Near 4th Block Shopping Complex, Jayanagar, Bengaluru 560011',
    timings: '08:00 AM - 07:00 PM (Daily)',
    contactPhone: '+91 80 2664 1209',
    managerName: 'Dr. G. Ramesh',
    acceptedMaterials: ['Mixed Paper', 'Beverage Cans', 'Plastics', 'Small Metals'],
  },
  {
    id: 'hub_hsr',
    name: 'HSR Layout Sector 2 Eco Recovery Hub',
    type: 'hub',
    categoryTitle: 'Citizen Green Sorting Hub',
    lat: 12.9121,
    lng: 77.6446,
    area: 'HSR Layout',
    address: '24th Main, Sector 2, HSR Layout, Bengaluru 560102',
    timings: '07:30 AM - 07:00 PM (Daily)',
    contactPhone: '+91 80 2572 8820',
    managerName: 'Sanjay Reddy',
    acceptedMaterials: ['Cardboard', 'Plastics', 'Appliances', 'Newspapers'],
  },
];

const ACTIVE_EV_TRUCKS: EcoLocation[] = [
  {
    id: 'truck_1',
    name: 'EV-Auto #1 (Indiranagar Route)',
    type: 'truck',
    categoryTitle: 'Doorstep EV Auto Loader',
    lat: 12.9665,
    lng: 77.638,
    area: 'Indiranagar',
    address: 'Currently near 12th Main Road, Indiranagar',
    timings: 'On Duty: 09:00 AM - 06:00 PM',
    contactPhone: '+91 98451 22301',
    managerName: 'Manjunath Gowda (Driver)',
    vehicleNo: 'KA-01-EV-4820',
    batteryStatus: '84% Charged (Solar Powered)',
    acceptedMaterials: ['All Household Scrap up to 250 kg'],
  },
  {
    id: 'truck_2',
    name: 'Mini Pickup Van #2 (Koramangala Route)',
    type: 'truck',
    categoryTitle: 'Heavy Doorstep EV Van',
    lat: 12.9412,
    lng: 77.621,
    area: 'Koramangala',
    address: 'Currently near Sony World Junction, Koramangala',
    timings: 'On Duty: 09:00 AM - 07:00 PM',
    contactPhone: '+91 98452 33412',
    managerName: 'Deepak Kumar (Driver)',
    vehicleNo: 'KA-03-TR-9102',
    batteryStatus: '92% Charged',
    acceptedMaterials: ['Household & Bulk Scrap up to 800 kg'],
  },
  {
    id: 'truck_3',
    name: 'E-Loader #3 (Peenya Industrial Belt)',
    type: 'truck',
    categoryTitle: 'Industrial Metal Scrap Loader',
    lat: 13.021,
    lng: 77.525,
    area: 'Peenya',
    address: 'Currently traversing Peenya Industrial Main Road',
    timings: 'On Duty: 08:30 AM - 06:30 PM',
    contactPhone: '+91 98453 44523',
    managerName: 'Suresh B (Driver)',
    vehicleNo: 'KA-04-EV-1144',
    batteryStatus: '76% Charged',
    acceptedMaterials: ['Industrial & Factory Scrap up to 1500 kg'],
  },
  {
    id: 'truck_4',
    name: 'E-Truck #4 (Whitefield Tech Route)',
    type: 'truck',
    categoryTitle: 'Tech Park IT Scrap Carrier',
    lat: 12.978,
    lng: 77.721,
    area: 'Whitefield',
    address: 'Currently near ITPL Main Gate, Whitefield',
    timings: 'On Duty: 09:30 AM - 07:00 PM',
    contactPhone: '+91 98454 55634',
    managerName: 'Ramesh Rao (Driver)',
    vehicleNo: 'KA-02-EV-6621',
    batteryStatus: '68% Charged',
    acceptedMaterials: ['Electronic Gadgets, Monitored IT Assets'],
  },
];

export const InteractiveEcoMap: React.FC<InteractiveEcoMapProps> = ({
  language,
  userProfile,
  cleanupDrives = [],
  onBookPickupHere,
  onBack,
}) => {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapView, setMapView] = useState<'standard' | 'satellite'>('standard');
  const [filterType, setFilterType] = useState<'all' | 'hub' | 'truck' | 'drive'>('all');
  const [selectedLocation, setSelectedLocation] = useState<EcoLocation | null>(COLLECTION_HUBS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Assemble dynamic locations including community drives
  const allLocations: EcoLocation[] = React.useMemo(() => {
    const driveLocations: EcoLocation[] = cleanupDrives.map((d, index) => {
      // Pin drives around famous Bengaluru locations
      const latOffset = (index % 3) * 0.02 - 0.01;
      const lngOffset = (index % 2) * 0.03 - 0.015;
      return {
        id: `drive_${d.id}`,
        name: d.title,
        type: 'drive',
        categoryTitle: `Community Drive (${d.targetCategory})`,
        lat: 12.9716 + latOffset,
        lng: 77.5946 + lngOffset,
        area: d.locality,
        address: `${d.locationHub}, ${d.locality}, ${d.city}`,
        timings: `${d.date} • ${d.time}`,
        contactPhone: '+91 80 2200 4400',
        managerName: d.organizer,
        driveDate: `${d.date} at ${d.time}`,
        acceptedMaterials: [d.targetCategory, 'Volunteers Welcome', `+${d.bonusPoints} Bonus Coins`],
      };
    });

    return [...COLLECTION_HUBS, ...ACTIVE_EV_TRUCKS, ...driveLocations];
  }, [cleanupDrives]);

  // Filtered locations
  const filteredLocations = React.useMemo(() => {
    return allLocations.filter((loc) => {
      if (filterType !== 'all' && loc.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          loc.name.toLowerCase().includes(query) ||
          loc.area.toLowerCase().includes(query) ||
          loc.address.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allLocations, filterType, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView([12.9716, 77.61], 12);

      const tileLayer = L.tileLayer(
        mapView === 'standard'
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution:
            mapView === 'standard'
              ? '&copy; OpenStreetMap contributors'
              : 'Tiles &copy; Esri',
        }
      ).addTo(map);
      tileLayerRef.current = tileLayer;

      const layerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = layerGroup;
      leafletInstance.current = map;
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  // Update map tile layer when satellite/standard toggles
  useEffect(() => {
    if (!leafletInstance.current || !tileLayerRef.current) return;

    leafletInstance.current.removeLayer(tileLayerRef.current);

    const newTileLayer = L.tileLayer(
      mapView === 'standard'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          mapView === 'standard'
            ? '&copy; OpenStreetMap contributors'
            : 'Tiles &copy; Esri',
      }
    ).addTo(leafletInstance.current);

    tileLayerRef.current = newTileLayer;
  }, [mapView]);

  // Render markers whenever filtered locations change
  useEffect(() => {
    if (!leafletInstance.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // User's Location Marker
    const userLat = userProfile.savedAddresses[0]?.lat || 12.9716;
    const userLng = userProfile.savedAddresses[0]?.lng || 77.6412;
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="background-color: #047857; color: white; border-radius: 50%; padding: 7px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold; font-size: 14px; text-align: center;">🏠</div>`,
      iconSize: [34, 34],
    });
    L.marker([userLat, userLng], { icon: userIcon })
      .addTo(markersLayerRef.current)
      .bindPopup(`<b>Your Address</b><br/>${userProfile.savedAddresses[0]?.street || 'Indiranagar'}`);

    // Loop through filtered locations
    filteredLocations.forEach((loc) => {
      let iconColor = '#059669'; // Emerald for hubs
      let emoji = '♻️';

      if (loc.type === 'truck') {
        iconColor = '#0284c7'; // Sky for EV Trucks
        emoji = '🛺';
      } else if (loc.type === 'drive') {
        iconColor = '#7c3aed'; // Purple for Community Drives
        emoji = '🌱';
      }

      const isSelected = selectedLocation?.id === loc.id;
      const markerHtml = `
        <div style="background-color: ${iconColor}; color: white; border-radius: 12px; padding: 6px 10px; border: ${
        isSelected ? '3px solid #fbbf24' : '2px solid white'
      }; box-shadow: 0 4px 12px rgba(0,0,0,0.35); font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px; white-space: nowrap; transform: ${
        isSelected ? 'scale(1.15)' : 'scale(1)'
      }; transition: transform 0.2s;">
          <span>${emoji}</span>
          <span>${loc.name.split(' ')[0]}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-eco-pin',
        html: markerHtml,
        iconSize: [110, 36],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedLocation(loc);
      });
      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredLocations, selectedLocation, userProfile]);

  // Center on selected location
  const handleSelectLocation = (loc: EcoLocation) => {
    setSelectedLocation(loc);
    if (leafletInstance.current) {
      leafletInstance.current.flyTo([loc.lat, loc.lng], 14, {
        duration: 1.2,
      });
    }
  };

  const handleQuickAreaJump = (lat: number, lng: number) => {
    if (leafletInstance.current) {
      leafletInstance.current.flyTo([lat, lng], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col space-y-4 p-4 sm:p-6">
      {/* Top Header Bar with Dual Back & Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all cursor-pointer border border-slate-200"
              title="Return to Scrap Categories"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
              <span>← Back</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Bengaluru Green Grid
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                LIVE FLEET & HUBS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              Interactive Scrap & EV Network Map
            </h2>
            <p className="text-xs text-slate-500">
              Locate nearby Material Recovery Facilities (MRFs), live doorstep EV auto loaders, and volunteer community drives.
            </p>
          </div>
        </div>

        {/* Quick Area Jump Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase text-slate-400 mr-1">Quick Jump:</span>
          {[
            { label: 'Indiranagar', lat: 12.9716, lng: 77.6412 },
            { label: 'Koramangala', lat: 12.9352, lng: 77.6245 },
            { label: 'Whitefield', lat: 12.9863, lng: 77.7308 },
            { label: 'Peenya', lat: 13.0285, lng: 77.5195 },
            { label: 'Jayanagar', lat: 12.9299, lng: 77.5824 },
          ].map((area) => (
            <button
              key={area.label}
              onClick={() => handleQuickAreaJump(area.lat, area.lng)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 text-[11px] font-bold rounded-lg transition-all border border-slate-200"
            >
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Grid Points', icon: Layers, count: allLocations.length },
            { id: 'hub', label: 'Collection Hubs', icon: MapPin, count: COLLECTION_HUBS.length },
            { id: 'truck', label: 'Active EV Trucks', icon: Truck, count: ACTIVE_EV_TRUCKS.length },
            { id: 'drive', label: 'Community Drives', icon: Users, count: cleanupDrives.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                    active ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search hub, locality, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Map + Side Details Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaflet Map Canvas (Span 2) */}
        <div className="lg:col-span-2 h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
          <div ref={mapRef} className="w-full h-full" />

          {/* Map Layer Switcher Floating Button */}
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-1 flex text-[10px] font-extrabold gap-1">
            <button
              onClick={() => setMapView('standard')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mapView === 'standard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setMapView('satellite')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mapView === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-2 text-[10px] space-y-1">
            <div className="font-extrabold text-slate-900 uppercase tracking-wider mb-0.5">Map Pins</div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Sorting & Recycling Hub</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
              <span>Live EV Pickup Truck</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-800 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
              <span>Community Cleanup Drive</span>
            </div>
          </div>
        </div>

        {/* Selected Point Details Card / Sidebar */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-4">
          {selectedLocation ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      selectedLocation.type === 'hub'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedLocation.type === 'truck'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedLocation.categoryTitle}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{selectedLocation.area}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 font-display mt-2">
                  {selectedLocation.name}
                </h3>
                <p className="text-xs text-slate-600 flex items-start gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{selectedLocation.address}</span>
                </p>
              </div>

              {/* Vehicle specific data if EV Truck */}
              {selectedLocation.vehicleNo && (
                <div className="p-3 bg-white rounded-xl border border-sky-100 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Vehicle Plate:</span>
                    <strong className="text-slate-900 font-mono">{selectedLocation.vehicleNo}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Battery Level:</span>
                    <span className="text-emerald-700 font-bold">{selectedLocation.batteryStatus}</span>
                  </div>
                </div>
              )}

              {/* Timings & Supervisor */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{selectedLocation.timings}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-bold">Contact:</span>
                  <span>{selectedLocation.managerName}</span>
                </div>
              </div>

              {/* Accepted Scrap Types */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">
                  Accepted Materials & Services:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLocation.acceptedMaterials.map((mat, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 shadow-2xs"
                    >
                      ✓ {mat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold">Select any pin on the map to inspect details</p>
            </div>
          )}

          {/* Action Buttons for Selected Location */}
          {selectedLocation && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {onBookPickupHere && (
                <button
                  onClick={() => onBookPickupHere(selectedLocation.area)}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4 text-emerald-200" />
                  <span>Book Doorstep Pickup in {selectedLocation.area}</span>
                </button>
              )}

              <div className="flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 text-center"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${selectedLocation.contactPhone.replace(/\s+/g, '')}`}
                  className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5"
                  title="Call Hub or Driver"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Directory Cards Carousel Below Map */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-extrabold uppercase text-slate-600 tracking-wider">
            Nearby Collection Points Directory ({filteredLocations.length} locations)
          </h4>
          <span className="text-[10px] text-slate-400">Click to focus on map</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLocations.slice(0, 6).map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-emerald-700">
                    {loc.area}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {loc.type === 'hub' ? '🏢 Hub' : loc.type === 'truck' ? '🛺 EV Fleet' : '🌱 Drive'}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 font-display line-clamp-1">
                  {loc.name}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {loc.address}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
