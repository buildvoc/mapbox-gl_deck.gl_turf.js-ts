import { MapWrapper } from "../components/styled-common";
import { DeckglWrapper } from "../components/deckgl-wrapper";
import { Layer, PickingInfo } from "@deck.gl/core/typed";
import { useEffect, useMemo, useState } from "react";
import { Gallery, GalleryImage } from "../types/gallery";
import { fetchGallery } from "../api/fetch-gallery";
import { IconLayer } from "@deck.gl/layers/typed";
import { fetchBuilding } from "../api/fetch-building";
import { createBuilding } from "../utils/deckgl-utils";
import { Backdrop, CircularProgress } from "@mui/material";

interface MapShowcaseViewProps {
  view: "firstPerson" | "map" | "orthographic";
}

export const MapShowcaseView = ({ view }: MapShowcaseViewProps) => {
  const [galleryData, setGalleryData] = useState<Gallery | null>(null);
  const [buildingLayers, setBuldingLayer] = useState<Layer[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState<boolean>(false);

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

  const imageLayers: Layer[] = useMemo(() => {
    const result: Layer[] = [];
    const images = galleryData?.data.images.data;

    if (!images) {
      return result;
    }

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
    return result;
  }, [galleryData]);

  useEffect(() => {
    if (!galleryData) {
      return;
    }

    const renderBuildingAsync = async (images: GalleryImage[]) => {
      const promises = [];
      for (const image of images) {
        promises.push(
          fetchBuilding(
            image.exif_data_latitude,
            image.exif_data_longitude,
            image.exif_data_altitude,
            image.exif_data_gps_img_direction
          )
        );
      }
      const buildings = await Promise.all(promises);
      let newLayers: Layer[] = [];
      for (let i = 0; i < buildings.length; i++) {
        const buildingData = buildings[i];
        const image = images[i];
        if (buildingData) {
          const currentLayers = createBuilding(
            buildingData.geojson,
            buildingData.cameraGPSData,
            image.filename
          );
          newLayers = newLayers.concat(currentLayers);
        }
      }
      setBuldingLayer(newLayers);
      setBuildingsLoading(false);
    };
    setBuildingsLoading(true);
    renderBuildingAsync(galleryData.data.images.data);
  }, [galleryData]);

  const layers = useMemo(() => {
    return [...buildingLayers, ...imageLayers];
  }, [imageLayers, buildingLayers]);

  return (
    <MapWrapper component="main">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={buildingsLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <DeckglWrapper
        parentViewState={null}
        view={view}
        layers={layers}
        onHover={onHoverHandler}
      />
    </MapWrapper>
  );
};
