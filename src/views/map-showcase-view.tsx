import { MapWrapper } from "../components/styled-common";
import { DeckglWrapper } from "../components/deckgl-wrapper";
import { Layer, PickingInfo } from "@deck.gl/core/typed";
import { useEffect, useMemo, useState } from "react";
import { Gallery } from "../types/gallery";
import { fetchGallery } from "../api/fetch-gallery";
import { IconLayer } from "@deck.gl/layers/typed";

interface MapShowcaseViewProps {
  view: "firstPerson" | "map" | "orthographic";
}

export const MapShowcaseView = ({ view }: MapShowcaseViewProps) => {
  const [galleryData, setGalleryData] = useState<Gallery | null>(null);
  const onHoverHandler = (info: PickingInfo) => {
    if (
      info.layer?.id !== "exif-icon-kayer" &&
      info.layer?.id !== "exif3d-camera-layer"
    ) {
      // setBuildingTooltipProps((prev) => ({
      //   ...prev,
      //   show: false,
      // }));
      return;
    }
    if (!info.picked) {
      return;
    }
    // setBuildingTooltipProps((prev) => ({
    //   ...prev,
    //   x: info.x,
    //   y: info.y,
    //   altitude: info.object?.altitude || 0,
    //   heading: info.object?.bearing || 0,
    //   show: true,
    // }));
  };

  useEffect(() => {
    fetchGallery().then((result) => {
      setGalleryData(result);
    });
  }, []);

  const layers: Layer[] = useMemo(() => {
    const result: Layer[] = [];
    const images = galleryData?.data.images.data;
    if (images) {
      for (const image of images) {
        result.push(
          new IconLayer({
            id: `gallery-image-${image.filename}`,
            data: [
              {
                coordinates: [
                  parseFloat(image.exif_data_longitude),
                  parseFloat(image.exif_data_latitude),
                  parseFloat(image.exif_data_altitude) + 10,
                ],
              },
            ],
            getIcon: () => "marker",
            iconAtlas: `https://buildingshistory.co.uk/galleries/${image.thumbnail_filename}`,
            // "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
            iconMapping: {
              marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
            },
            getPosition: (d) => d.coordinates,
            getColor: [0, 140, 0],
            getSize: () => 5,
            sizeScale: 8,
            billboard: true,
            pickable: true,
          })
        );
      }
    }
    return result;
  }, [galleryData]);

  console.log(layers);
  return (
    <MapWrapper component="main">
      <DeckglWrapper
        parentViewState={null}
        view={view}
        layers={layers}
        onHover={onHoverHandler}
      />
    </MapWrapper>
  );
};
