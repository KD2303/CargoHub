export const getMapTileUrl = (themeMode: 'light' | 'dark'): string => {
  const apiKey = (process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY || '').replace(/"/g, '');
  if (!apiKey) {
    console.warn('OLA Maps API Key is missing. Maps will not load.');
    return '';
  }
  return `https://api.olamaps.io/tiles/v1/styles/default-${themeMode}-standard/{z}/{x}/{y}.png?api_key=${apiKey}`;
};
