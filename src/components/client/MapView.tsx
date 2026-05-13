'use client';

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Props {
  lat: number;
  lng: number;
  standerLat?: number | null;
  standerLng?: number | null;
  standerInitials?: string;
}

export default function MapView({ lat, lng, standerLat, standerLng, standerInitials }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const standerMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
      version: 'weekly',
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        styles: [
          {
            featureType: 'all',
            elementType: 'all',
            stylers: [{ saturation: -100 }, { lightness: 20 }],
          },
        ],
        disableDefaultUI: true,
      });

      mapInstanceRef.current = map;

      // Location Marker
      new google.maps.Marker({
        position: { lat, lng },
        map,
        title: 'Queue Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#1A1612',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        },
      });

      // Stander Marker
      if (standerLat && standerLng) {
        standerMarkerRef.current = new google.maps.Marker({
          position: { lat: standerLat, lng: standerLng },
          map,
          label: {
            text: standerInitials || 'S',
            color: '#FFFFFF',
            fontFamily: 'Bebas Neue',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillColor: '#FF6B00',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
          },
        });
      }
    });
  }, [lat, lng]);

  // Update stander position
  useEffect(() => {
    if (mapInstanceRef.current && standerMarkerRef.current && standerLat && standerLng) {
      const newPos = { lat: standerLat, lng: standerLng };
      standerMarkerRef.current.setPosition(newPos);
      mapInstanceRef.current.panTo(newPos);
    } else if (mapInstanceRef.current && standerLat && standerLng && !standerMarkerRef.current) {
      // Create if it didn't exist before
      standerMarkerRef.current = new google.maps.Marker({
        position: { lat: standerLat, lng: standerLng },
        map: mapInstanceRef.current,
        label: {
          text: standerInitials || 'S',
          color: '#FFFFFF',
          fontFamily: 'Bebas Neue',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#FF6B00',
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        },
      });
    }
  }, [standerLat, standerLng, standerInitials]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[200px] rounded-[10px] bg-[#1f180e] overflow-hidden border border-[#D4CFC6]"
    />
  );
}
