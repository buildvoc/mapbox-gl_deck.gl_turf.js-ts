import { Proj4Projection } from "@math.gl/proj4";

export const positionProjection = new Proj4Projection({
  from: "EPSG:3857",
  to: "WGS84",
});

export const transformLazData = (lazData: {
  attributes: { POSITION: { value: Float32Array } };
}) => {
  const positions = lazData.attributes.POSITION.value;
  for (let i = 0; i < positions.length - 1; i += 3) {
    const vertex = Array.from(positions.subarray(i, i + 3));
    const transformed = positionProjection.project(vertex);
    positions.set(transformed, i);
  }
};
