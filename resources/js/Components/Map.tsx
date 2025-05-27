// src/Components/Map.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon paths
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Custom icon fix for Leaflet default marker
const defaultIcon = L.icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface MapProps {
    latitude: number;
    longitude: number;
    address: string;
}

const Map: React.FC<MapProps> = ({ latitude, longitude, address }) => {
    const position: [number, number] = [latitude, longitude];

    return (
        <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "300px", width: "100%", borderRadius: "8px" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>
                    <strong>Address:</strong>
                    <br />
                    {address || "No address available"}
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default Map;
