const API_URL = "https://api.buildingshistory.co.uk";

export const fetchBuilding = async (
  lat: string,
  lon: string,
  camAltitude: string,
  camDirection: string
) => {
  let lng = parseFloat(lon);
  if (lng > 0) lng = -Math.abs(parseFloat(lon));

  const response = await fetch(
    // prettier-ignore
    `${API_URL}/api/v1/building-part/nearest?latitude=${parseFloat(lat)}&longitude=${lng}&imagedirection=${camDirection}`
  );
  const data = await response.json();

  if (
    data.data.building_part.length > 0 &&
    data.data.building_part[0].geojson
  ) {
    return {
      geojson: data.data.building_part[0].geojson,
      cameraGPSData: [
        {
          coordinates: [lng, parseFloat(lat), parseFloat(camAltitude)],
          bearing: parseFloat(camDirection),
          altitude: parseFloat(camAltitude),
        },
      ],
    };
  }
  alert("No records found in our database");
  return null;
};
