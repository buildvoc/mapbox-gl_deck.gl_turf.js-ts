import { Proj4Projection } from "@math.gl/proj4";

const OSGB36_BRITISH_NATIONAL_GRID =
  "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +nadgrids=OSTN15_NTv2_OSGBtoETRS.gsb +units=m +no_defs +type=crs";
export const positionProjection = new Proj4Projection({
  from: OSGB36_BRITISH_NATIONAL_GRID,
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
