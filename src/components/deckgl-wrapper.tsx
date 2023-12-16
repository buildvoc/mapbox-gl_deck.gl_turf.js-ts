import {
  AmbientLight,
  FirstPersonController,
  FirstPersonView,
  Layer,
  LightingEffect,
  MapController,
  MapView,
  PickingInfo,
} from "@deck.gl/core/typed";
import { DeckGL } from "@deck.gl/react/typed";
import { MultiviewMapViewState } from "../types/map-view-state";
import { ViewStateChangeParameters } from "@deck.gl/core/typed/controllers/controller";
import { useEffect, useMemo, useState } from "react";
import { TerrainLayer } from "@deck.gl/geo-layers/typed";

interface DeckglWrapperProps {
  parentViewState: MultiviewMapViewState | null;
  view: "firstPerson" | "map" | "orthographic";
  layers: Layer[];
  onHover: (info: PickingInfo) => void;
}

export const DeckglWrapper = ({
  parentViewState,
  view,
  layers,
  onHover,
}: DeckglWrapperProps) => {
  const [viewState, setViewState] = useState<MultiviewMapViewState>({
    mapView: {
      latitude: 51.212834405074766,
      longitude: -0.8013357346147122,
      zoom: 13,
      pitch: 45,
      maxPitch: 85,
    },
    firstPersonView: {
      latitude: 51.212834405074766,
      longitude: -0.8013357346147122,
      position: [0, -60, 120],
      pitch: 20,
      maxPitch: 89,
      bearing: 0,
    },
  });
  const [commonLayers, setCommonLayers] = useState<Layer[]>([]);

  useEffect(() => {
    if (parentViewState !== null) {
      setViewState(parentViewState);
    }
  }, [parentViewState]);

  useEffect(() => {
    if (view === "orthographic") {
      setViewState({
        ...viewState,
        mapView: {
          ...viewState.mapView,
          pitch: 0,
        },
      });
    }
    // eslint-disable-next-line
  }, [view]);

  useEffect(() => {
    const deckglTerrainLayer = new TerrainLayer({
      id: "terrain",
      maxZoom: 16,
      elevationDecoder: {
        rScaler: 6553.6,
        gScaler: 25.6,
        bScaler: 0.1,
        offset: -10000,
      },
      loadOptions: {
        terrain: {
          tesselator: "martini",
          skirtHeight: 50,
        },
      },
      // Digital elevation model from https://www.usgs.gov/
      elevationData:
        "https://tiles.buildingshistory.co.uk/geoserver/gwc/service/tms/1.0.0/dem%3ARGB_Terrain@WebMercatorQuad@png/{z}/{x}/{y}.png?flipY=true",
      texture:
        "https://tiles.buildingshistory.co.uk/geoserver/gwc/service/tms/1.0.0/buildings%3AOutdoor_3857@WebMercatorQuad@png/{z}/{x}/{y}.png?flipY=true",
      meshMaxError: 0.6,
    });
    setCommonLayers([deckglTerrainLayer]);
  }, []);

  const onViewStateChangeHandler = (parameters: ViewStateChangeParameters) => {
    const { viewState: deckViewState } = parameters;

    let newViewState;
    if (view === "map" || view === "orthographic") {
      newViewState = {
        mapView: deckViewState,
        firstPersonView: {
          ...viewState.firstPersonView,
          longitude: deckViewState.longitude,
          latitude: deckViewState.latitude,
        },
      };
    } else {
      newViewState = {
        mapView: {
          ...viewState.mapView,
          longitude: deckViewState.longitude,
          latitude: deckViewState.latitude,
        },
        firstPersonView: deckViewState,
      };
    }
    setViewState(newViewState);
  };

  const VIEWS = useMemo(
    () =>
      view === "map" || view === "orthographic"
        ? [
            new MapView({
              id: "mapView",
              controller: {
                type: MapController,
                touchRotate: true,
                touchZoom: true,
              },
              farZMultiplier: 2.02,
              orthographic: view === "orthographic",
            }),
          ]
        : [
            new FirstPersonView({
              id: "firstPersonView",
              controller: {
                type: FirstPersonController,
              },
            }),
          ],
    [view]
  );

  return (
    <DeckGL
      viewState={
        view === "map" || view === "orthographic"
          ? viewState.mapView
          : viewState.firstPersonView
      }
      onViewStateChange={onViewStateChangeHandler}
      onHover={onHover}
      layers={[...commonLayers, ...layers]}
      views={VIEWS}
      effects={[
        new LightingEffect({
          ambientLight: new AmbientLight({
            color: [255, 255, 255],
            intensity: 3,
          }),
        }),
      ]}
    />
  );
};
