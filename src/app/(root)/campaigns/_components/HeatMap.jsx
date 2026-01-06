"use client";
import React from 'react'
import { GoogleMap, HeatmapLayerF, useJsApiLoader } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const HeatMap = ({ locations }) => {
    const mapStyles = { height: "100%", width: "100%" };
    const center = { lat: 29.945, lng: 76.818 };

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyCX0Ok8zf-FVwHOKQKvJ0__82QSLcaW1bA",
        libraries: ["visualization"],
    });

    const heatmapData = isLoaded
        ? locations
            .filter((loc) => loc && loc.latitude !== undefined && loc.longitude !== undefined)
            .map((loc) => new window.google.maps.LatLng(loc.latitude, loc.longitude))
        : [];

    const heatmapOptions = { radius: 10, opacity: 0.6 };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 size={32} className="animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="w-full h-full rounded-lg overflow-hidden">
            <GoogleMap mapContainerStyle={mapStyles} zoom={4} center={center}>
                {heatmapData.length > 0 && (
                    <HeatmapLayerF data={heatmapData} options={heatmapOptions} />
                )}
            </GoogleMap>
        </div>
    );
};

export default HeatMap
