import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance: Loader | null = null;

/**
 * Singleton Google Maps Loader
 */
export function getMapLoader(): Loader {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
      version: 'weekly',
      libraries: ['places', 'geometry', 'marker'],
    });
  }
  return loaderInstance;
}

/**
 * Custom Dark Map Styles for QueuePe Brand
 */
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1a1612' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a08060' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1612' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#362a16' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#1f180e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2e2416' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0c0a06' }],
  },
];

/**
 * Initialize a Google Map with custom branding
 */
export async function initMap(
  element: HTMLDivElement,
  center: { lat: number; lng: number },
  zoom = 15
): Promise<google.maps.Map> {
  const loader = getMapLoader();
  const { Map } = (await loader.importLibrary('maps')) as google.maps.MapsLibrary;

  return new Map(element, {
    center,
    zoom,
    styles: darkMapStyles,
    disableDefaultUI: true,
    mapId: 'queuepe-map',
  });
}

/**
 * Adds a custom branded marker to the map
 */
export async function addMarker(
  map: google.maps.Map,
  position: { lat: number; lng: number },
  label: string,
  color: 'saffron' | 'green' = 'saffron'
): Promise<any> {
  const loader = getMapLoader();
  const { AdvancedMarkerElement, PinElement } = (await loader.importLibrary(
    'marker'
  )) as google.maps.MarkerLibrary;

  const pin = new PinElement({
    background: color === 'saffron' ? '#FF6B00' : '#1A7A4A',
    glyphColor: '#fff',
    borderColor: 'transparent',
  });

  return new AdvancedMarkerElement({
    map,
    position,
    content: pin.element,
    title: label,
  });
}
