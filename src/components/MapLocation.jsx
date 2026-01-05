"use client";
import React from "react";
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayerF,
} from "@react-google-maps/api";

const MapLocation = ({ locations }) => {
  const mapStyles = {
    height: "386px",
    width: "100%",
  };
  const center = { lat: 22.945, lng: 76.818 };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCX0Ok8zf-FVwHOKQKvJ0__82QSLcaW1bA", // Replace with your API key
    libraries: ["visualization"], // Add the required visualization library here
  });

  const heatmapData = isLoaded
    ? locations
        .filter(
          (loc) =>
            loc && loc.latitude !== undefined && loc.longitude !== undefined
        )
        .map(
          (loc) => new window.google.maps.LatLng(loc.latitude, loc.longitude)
        )
    : [];

  const heatmapOptions = {
    radius: 10,
    opacity: 0.6,
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className=" min-w-[12rem] min-h-[25rem] w-full bg-white rounded-lg flex max-lg:flex-col justify-center items-center p-2 lg:h-full py-2 max-h-[20.5rem] h-full">
      <div className="w-full h-full rounded-lg overflow-hidden">
        <GoogleMap mapContainerStyle={mapStyles} zoom={5} center={center}>
          {heatmapData.length > 0 && (
            <HeatmapLayerF data={heatmapData} options={heatmapOptions} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default MapLocation;
