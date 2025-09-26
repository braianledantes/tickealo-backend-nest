const toRad = (value: number) => (value * Math.PI) / 180;

/**
 * Verifica si un punto está dentro de un área circular definida por un centro y un radio.
 * @param param0 Objeto que contiene latitud, longitud y radio en kilómetros.
 * @returns true si el punto está dentro del área, false en caso contrario.
 */
export const checkWithinArea = (
  lugar: { latitud: number; longitud: number },
  latitud: number,
  longitud: number,
  radius: number,
) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lugar.latitud - latitud);
  const dLon = toRad(lugar.longitud - longitud);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(latitud)) *
      Math.cos(toRad(lugar.latitud)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km

  return distance <= radius;
};
