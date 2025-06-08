// components/MapPicker.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icon issue
import "leaflet/dist/leaflet.css";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface MapPickerProps {
    value?: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }) => void;
}

const LocationMarker = ({
    onChange,
}: {
    onChange: MapPickerProps["onChange"];
}) => {
    useMapEvents({
        click(e) {
            onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ value, onChange }) => {
    return (
        <MapContainer
            center={value || { lat: 15.5007, lng: 32.5599 }} // Default: Khartoum
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "300px", width: "100%", marginBottom: 20 }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {value && <Marker position={value} />}
            <LocationMarker onChange={onChange} />
        </MapContainer>
    );
};

export default MapPicker;
