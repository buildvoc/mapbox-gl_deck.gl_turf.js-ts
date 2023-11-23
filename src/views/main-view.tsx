import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";

import ExifReader from "exifreader";
import { Backdrop, CircularProgress, Snackbar, Alert } from "@mui/material";

import { MapResultView } from "./map-result-view";
import { InfoModal } from "../components/info-modal";
import { BottomNav } from "../components/bottom-navigation";
import { PhotoView } from "./photo-view";
import { InfoButton } from "../components/info-button";

const API_URL = "https://api.buildingshistory.co.uk";

enum LAYOUT {
  PHOTO,
  RESULT,
}

export const MainView = () => {
  const [activeLayout, setActiveLayout] = React.useState(LAYOUT.PHOTO);
  const ref = React.useRef<HTMLDivElement>(null);

  const [selectedImg, setSelectedImg] = useState<string | null | undefined>(
    undefined
  );

  const [view, setView] = useState<"firstPerson" | "map">("firstPerson");

  useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
  }, [activeLayout]);

  const [extractedDrawerOpen, setExtractedDrawerOpen] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<any>();
  useEffect(() => {
    if (!selectedImg) {
      return;
    }
    handleImage(selectedImg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImg]);

  const handleImage = async (img: any) => {
    try {
      setLoading(true);
      const tags = await ExifReader.load(img);
      delete tags["MakerNote"];
      setTags(tags);
      setExtractedDrawerOpen(true);
      if (
        tags?.GPSLatitude?.description &&
        tags?.GPSLongitude?.description &&
        tags.GPSAltitude?.description &&
        tags.GPSImgDirection?.description
      ) {
        const areGPSContainsNaN = ["NaN", "NaN m", ""].some((r: any) =>
          [
            tags?.GPSLongitude?.description,
            tags.GPSAltitude?.description,
          ].includes(r)
        );
        if (!areGPSContainsNaN)
          getPolygon(
            tags.GPSLatitude.description,
            tags.GPSLongitude.description,
            tags.GPSAltitude?.description,
            tags.GPSImgDirection?.description
          );
        else {
          alert("Image reader can't read gps");
          setLoading(false);
        }
      } else {
        alert("Image doesn't have gps");
        setLoading(false);
      }
    } catch (error: any) {
      const errMsg =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setErrMsg(errMsg);
      setLoading(false);
    }
  };

  const [errMsg, setErrMsg] = useState<any>();
  const [geo, setGeo] = useState<any>();

  const getPolygon = async (
    lat: string,
    lon: string,
    camAltitude: string,
    camHeight: string
  ) => {
    try {
      setLoading(true);
      setErrMsg(null);
      let lng = parseFloat(lon);
      if (lng > 0) lng = -Math.abs(parseFloat(lon));

      const response = await fetch(
        // prettier-ignore
        `${API_URL}/api/v1/building-part/nearest?latitude=${parseFloat(lat)}&longitude=${lng}&imagedirection=${camHeight}`
      );
      const data = await response.json();

      if (
        data.data.building_part.length > 0 &&
        data.data.building_part[0].geojson
      ) {
        setGeo({
          geojson: data.data.building_part[0].geojson,
          cameraGPSData: [
            {
              coordinates: [lng, parseFloat(lat), parseFloat(camAltitude)],
              bearing: parseFloat(camHeight),
              altitude: parseFloat(camAltitude),
            },
          ],
        });
        setActiveLayout(LAYOUT.RESULT);
      } else {
        alert("No records found in our database");
      }
      setLoading(false);
    } catch (error: any) {
      const errMsg =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      setErrMsg(errMsg);
      setLoading(false);
    }
  };

  const [infoOpen, setInfoOpen] = React.useState(false);
  const toggleInfo = () => setInfoOpen(!infoOpen);

  const onLayoutChange = (newLayout: number) => {
    if (geo) setActiveLayout(newLayout);
    else {
      alert("Please upload a photo");
      setActiveLayout(LAYOUT.PHOTO);
    }
  };

  const onViewToggleHandler = () => {
    if (view === "firstPerson") {
      setView("map");
    } else {
      setView("firstPerson");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }} ref={ref}>
      <CssBaseline />
      {activeLayout === LAYOUT.PHOTO ? (
        <PhotoView
          tags={tags}
          selectedImg={selectedImg}
          extractedDrawerOpen={extractedDrawerOpen}
          onImageChange={(result) => setSelectedImg(result)}
          setExtractedDrawerOpen={setExtractedDrawerOpen}
        />
      ) : (
        <MapResultView geo={geo} view={view} />
      )}

      <BottomNav
        value={activeLayout}
        view={view}
        onChange={onLayoutChange}
        onViewToggle={onViewToggleHandler}
      />

      <Snackbar open={errMsg} autoHideDuration={6000}>
        <Alert severity="success" sx={{ width: "100%" }}>
          {errMsg}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <InfoButton toggleInfo={toggleInfo} />
      <InfoModal infoOpen={infoOpen} toggleInfo={toggleInfo} />
    </Box>
  );
};
