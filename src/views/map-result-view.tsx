import { useState, useEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";

import {
  Layer,
  LightingEffect,
  AmbientLight,
  MapController,
  FirstPersonController,
  FirstPersonView,
  MapView,
  PickingInfo,
} from "@deck.gl/core/typed";
import { DeckGL } from "@deck.gl/react/typed";
import {
  GeoJsonLayer,
  PolygonLayer,
  IconLayer,
  PointCloudLayer,
} from "@deck.gl/layers/typed";
import { ScenegraphLayer } from "@deck.gl/mesh-layers/typed";
import { TerrainLayer } from "@deck.gl/geo-layers/typed";
import { LASLoader } from "@loaders.gl/las";

import { FileContents } from "../types/file";
import {
  computeGeoMatrics,
  getOffsetBehindCamera,
} from "../utils/geo-operations";

import heritageTrail from "../data/heritage-trail";
import { FeatureCollection } from "@turf/turf";
import { BuildingAttributes } from "../components/building-attributes";
import { UserInputs } from "../types/user-inputs";
import { Metrics } from "../types/metrics";
import { ViewStateChangeParameters } from "@deck.gl/core/typed/controllers/controller";
import { transformLazData } from "../utils/projection";
import { load } from "@loaders.gl/core";
import { NginxFile } from "../types/nginx";
import { LAZ_FILES_LIST_URL } from "../constants";
import {
  BuildingTooltip,
  BuildingTooltipProps,
} from "../components/building-tooltip";

function onClick(info: any) {
  const tooltipElement = document.getElementById("custom-tooltip");
  const coordinates = info.coordinate;

  while (Math.abs(info.viewport.longitude - coordinates[0]) > 180) {
    coordinates[0] += info.viewport.longitude > coordinates[0] ? 360 : -360;
  }
  tooltipElement!.style.display = "none";
}

interface MapResultViewProps {
  geo: any;
  view: "firstPerson" | "map" | "orthographic";
  imageUrl: string | null;
  drawLaz: boolean;
  lazFile: NginxFile | null;
}

export const MapResultView = ({
  geo,
  view,
  imageUrl,
  drawLaz,
  lazFile,
}: MapResultViewProps) => {
  const [inputs, setInputs] = useState<UserInputs>({
    lotCoverage: 50,
    floorNumber: 10,
    floorHeight: 10,
  });
  const [geojsonFileContents, setGeojsonFileContents] = useState<FileContents>({
    type: "",
    coordinates: [[]],
  });
  const [layers, setLayers] = useState<Layer[]>([]);
  const viewStateRef = useRef<{
    mapView: Record<string, any>;
    firstPersonView: Record<string, any>;
  }>({
    mapView: {
      latitude: 46.203589,
      longitude: 6.1369,
      zoom: 17.5,
      pitch: 45,
      maxPitch: 85,
    },
    firstPersonView: {
      latitude: 46.203589,
      longitude: 6.1369,
      position: [0, -60, 120],
      pitch: 20,
      maxPitch: 89,
      bearing: 0,
    },
  });
  const [viewState, setViewState] = useState<{
    mapView: Record<string, any>;
    firstPersonView: Record<string, any>;
  }>(viewStateRef.current);

  const [metrics, setMetrics] = useState<Metrics>({
    landArea: 0,
    buildingArea: 0,
    volume: 0,
    buildingHeight: inputs.floorHeight * inputs.floorNumber,
  });

  const [buildingTooltipProps, setBuildingTooltipProps] =
    useState<BuildingTooltipProps>({
      show: false,
      x: 0,
      y: 0,
      imageUrl: null,
      altitude: 0,
      heading: 0,
    });

  useEffect(() => {
    setBuildingTooltipProps((prev) => ({
      ...prev,
      imageUrl,
    }));
  }, [imageUrl]);

  useEffect(() => {
    if (drawLaz && lazFile) {
      const drawLaz = async () => {
        const url = `${LAZ_FILES_LIST_URL}${lazFile.name}`;
        const data = await load(url, LASLoader);
        transformLazData(data);
        const newLayers = layers.filter((layer) => layer.id !== "las");
        newLayers.push(
          new PointCloudLayer({
            id: "las",
            data,
            getNormal: [0, 1, 0],
            getColor: [0, 0, 255],
            opacity: 1,
            pointSize: view === "firstPerson" ? 50 : 1,
            loaders: [LASLoader],
          })
        );
        setLayers(newLayers);
      };
      drawLaz();
    }
    // eslint-disable-next-line
  }, [drawLaz, lazFile, view]);

  const { lotCoverage, floorNumber, floorHeight } = inputs;

  const onHoverHandler = (info: PickingInfo) => {
    if (
      info.layer?.id !== "exif-icon-kayer" &&
      info.layer?.id !== "exif3d-camera-layer"
    ) {
      setBuildingTooltipProps((prev) => ({
        ...prev,
        show: false,
      }));
      return;
    }
    if (!info.picked) {
      return;
    }
    setBuildingTooltipProps((prev) => ({
      ...prev,
      x: info.x,
      y: info.y,
      altitude: info.object?.altitude || 0,
      heading: info.object?.bearing || 0,
      show: true,
    }));
  };

  const createDefaultBuilding = (
    land: string,
    building: FeatureCollection,
    buildingHeight: number,
    cameraGPSData: any
  ): void => {
    const ground = new GeoJsonLayer({
      id: "geojson-ground-layer",
      data: land,
      getLineColor: [0, 0, 0, 255],
      getFillColor: [183, 244, 216, 255],
      getLineWidth: () => 0.3,
      opacity: 1,
    });

    const buildingDataCopy = [
      ...(building.features[0].geometry as any).coordinates,
    ];
    let buildingCoords = buildingDataCopy[0].map((item: any) => {
      item.push(building.features[0].properties!.absoluteheightminimum);
      return item;
    });
    const polygonData = [
      {
        contour: buildingCoords,
      },
    ];

    const storey = new PolygonLayer({
      id: "geojson-storey-building",
      data: polygonData,
      extruded: true,
      wireframe: true,
      getPolygon: (d) => {
        return d.contour;
      },
      getFillColor: [249, 180, 45, 255],
      getLineColor: [0, 0, 0, 255],
      getElevation: buildingHeight,
      opacity: 1,
    });
    const url = "./cam.gltf";
    const exif3dCameraLayer = new ScenegraphLayer({
      id: "exif3d-camera-layer",
      data: cameraGPSData,
      scenegraph: url,
      getPosition: (d) => d.coordinates,
      getColor: (d) => [203, 24, 226],
      getOrientation: (d) => [0, -d.bearing, 90],
      pickable: true,
      opacity: 1,
    });

    const deckglMarkerLayer = new IconLayer({
      id: "exif-icon-kayer",
      data: cameraGPSData,
      getIcon: () => "marker",
      iconAtlas:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: {
        marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
      },
      getPosition: (d) => d.coordinates,
      getColor: (d) => [Math.sqrt(d.exits), 140, 0],
      getSize: () => 5,
      sizeScale: 8,
      billboard: true,
      pickable: true,
      onClick: onClick,
    });

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
    setLayers([
      ground,
      storey,
      exif3dCameraLayer,
      deckglMarkerLayer,
      deckglTerrainLayer,
    ]);
  };

  useEffect(() => {
    if (view === "orthographic") {
      viewStateRef.current = {
        ...viewStateRef.current,
        mapView: {
          ...viewStateRef.current.mapView,
          pitch: 0,
        },
      };
      setViewState(viewStateRef.current);
    }
  }, [view]);

  useEffect(() => {
    handleFileRead(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  const handleFileRead = (
    isFileUpload: boolean,
    customFileData?: string | ArrayBuffer | null
  ) => {
    let result = JSON.stringify(heritageTrail) as any;
    if (customFileData) result = customFileData;

    let geojson = JSON.parse(result);
    if (!isFileUpload) geojson = geo.geojson;

    const { center, landArea, buildingArea, volume } = computeGeoMatrics(
      geojson.features[0].geometry.coordinates,
      floorHeight,
      floorNumber,
      lotCoverage
    );
    const {
      geometry: {
        coordinates: [longitude, latitude],
      },
    } = center;

    createDefaultBuilding(
      geojson,
      geojson,
      parseFloat(geojson.features[0].properties.relativeheightmaximum),
      geo.cameraGPSData
    );
    const polygonElevation =
      geojson.features?.[0]?.geometry?.coordinates?.[0]?.[0]?.[2] || 0;
    const camera = geo?.cameraGPSData?.[0];
    const bearing = camera?.bearing ? camera?.bearing : 0;
    const fpPosition = getOffsetBehindCamera(
      bearing,
      polygonElevation,
      camera?.coordinates
    );
    viewStateRef.current = {
      mapView: {
        ...viewStateRef.current.mapView,
        longitude,
        latitude,
        zoom: 17.5,
        position: [0, 0, polygonElevation],
      },
      firstPersonView: {
        ...viewStateRef.current.firstPersonView,
        longitude: camera?.coordinates?.[0] || longitude,
        latitude: camera?.coordinates?.[1] || latitude,
        position: fpPosition,
        pitch: 0,
        bearing,
      },
    };
    setViewState(viewStateRef.current);

    setGeojsonFileContents(geojson);
    setMetrics({
      landArea,
      buildingArea,
      buildingHeight: parseFloat(
        geojson.features[0].properties.relativeheightmaximum
      ),
      volume,
    });
    if (!(lotCoverage === 50 && floorHeight === 10 && floorNumber === 10)) {
      setInputs({ lotCoverage: 50, floorNumber: 10, floorHeight: 10 });
    }
  };

  const onViewStateChangeHandler = (parameters: ViewStateChangeParameters) => {
    const { viewState, oldViewState } = parameters;
    const viewToCompare =
      view === "firstPerson"
        ? viewStateRef.current.firstPersonView
        : viewStateRef.current.mapView;
    if (
      oldViewState?.longitude !== viewToCompare.longitude ||
      oldViewState?.latitude !== viewToCompare.latitude
    ) {
      return;
    }
    if (view === "map" || view === "orthographic") {
      viewStateRef.current = {
        mapView: viewState,
        firstPersonView: {
          ...viewStateRef.current.firstPersonView,
          longitude: viewState.longitude,
          latitude: viewState.latitude,
        },
      };
    } else {
      viewStateRef.current = {
        mapView: {
          ...viewStateRef.current.mapView,
          longitude: viewState.longitude,
          latitude: viewState.latitude,
        },
        firstPersonView: viewState,
      };
    }
    setViewState(viewStateRef.current);
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
    <>
      <>
        <BuildingAttributes
          geojsonFileContents={geojsonFileContents}
          metrics={metrics}
          handleFileRead={handleFileRead}
        />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            position: "absolute",
            height: "100vh",
            width: "100vw",
            overflow: "hidden",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <div
              className="custom-tooltip"
              id="custom-tooltip"
              style={{
                position: "absolute",
                height: "max-content",
                width: "max-content",
                background: "white",
                color: "white",
                padding: "5px",
                borderRadius: "5px",
              }}
            ></div>
            <BuildingTooltip {...buildingTooltipProps} />

            <DeckGL
              viewState={
                view === "map" || view === "orthographic"
                  ? viewState.mapView
                  : viewState.firstPersonView
              }
              onViewStateChange={onViewStateChangeHandler}
              onHover={onHoverHandler}
              layers={layers}
              views={VIEWS}
              effects={[
                new LightingEffect({
                  ambientLight: new AmbientLight({
                    color: [255, 255, 255],
                    intensity: 3,
                  }),
                }),
              ]}
            ></DeckGL>
          </Container>
        </Box>
      </>
    </>
  );
};
