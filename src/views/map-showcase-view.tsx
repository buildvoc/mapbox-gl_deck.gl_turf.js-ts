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
import {
  ShowcaseTooltip,
  ShowcaseTooltipProps,
} from "../components/showcase-tooltip";

interface MapShowcaseViewProps {
  view: "firstPerson" | "map" | "orthographic";
}

export const MapShowcaseView = ({ view }: MapShowcaseViewProps) => {
  const [galleryData, setGalleryData] = useState<Gallery | null>(null);
  const [buildingLayers, setBuldingLayer] = useState<Layer[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState<boolean>(false);

  const [showcaseTooltipProps, setShowcaseTooltipProps] =
    useState<ShowcaseTooltipProps>({
      show: false,
      x: 0,
      y: 0,
      imageUrl: null,
      longitude: "",
      latitude: "",
      name: "",
      address: "",
      date: "",
    });

  const onHoverHandler = (info: PickingInfo) => {
    if (info.layer?.id !== "gallery-images") {
      setShowcaseTooltipProps((prev) => ({
        ...prev,
        show: false,
      }));
      return;
    }
    if (!info.picked) {
      return;
    }
    setShowcaseTooltipProps((prev) => ({
      ...prev,
      x: info.x,
      y: info.y,
      longitude: info.object?.["exif_data_longitude"],
      latitude: info.object?.["exif_data_latitude"],
      name: info.object?.["description"],
      address: info.object?.["long_description"],
      date: info.object?.["exif_data_taken_at"],
      imageUrl: `https://buildingshistory.co.uk/galleries/${info.object?.["thumbnail_filename"]}`,
      show: true,
    }));
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

    result.push(
      new IconLayer({
        id: `gallery-images`,
        data: images,
        getIcon: (d) => {
          return {
            url: `https://buildingshistory.co.uk/galleries/${d.thumbnail_filename}`,
            height: 240,
            width: 180,
            id: d.id,
            mask: false,
          };
        },

        getPosition: (d) => [
          parseFloat(d.exif_data_longitude),
          parseFloat(d.exif_data_latitude),
          parseFloat(d.exif_data_altitude) + 10,
        ],
        getSize: () => 5,
        sizeScale: 8,
        billboard: true,
        pickable: true,
      })
    );

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
      <ShowcaseTooltip {...showcaseTooltipProps} />
      <DeckglWrapper
        parentViewState={null}
        view={view}
        layers={layers}
        onHover={onHoverHandler}
      />
    </MapWrapper>
  );
};
