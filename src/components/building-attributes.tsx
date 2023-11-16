import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  Toolbar,
  Typography,
  styled,
} from "@mui/material";
import MetricDisplay from "./metric-display/metric-display";
import { useState } from "react";
import { FileContents } from "../types/file";
import heritageTrail from "../data/heritage-trail";
import { Metrics } from "../types/metrics";

const DRAWER_WIDTH: number = 300;
const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: DRAWER_WIDTH,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

interface BuildingAttributesProps {
  geojsonFileContents: FileContents;
  metrics: Metrics;
  handleFileRead: (
    isFileUpload: boolean,
    customFileData?: string | ArrayBuffer | null
  ) => void;
}

export const BuildingAttributes = ({
  geojsonFileContents,
  metrics,
  handleFileRead,
}: BuildingAttributesProps) => {
  const [open, setOpen] = useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [fileName, setFileName] = useState<string>("");

  const { landArea, buildingArea, volume, buildingHeight } = metrics;

  const onFileSelectHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const { name } = e.target.files[0];
      let allowedExtension = /.geojson/;
      if (!allowedExtension.exec(name)) {
        alert("Invalid File type uploaded. Only .geojson files supported");
        return;
      }

      const fileReader = new FileReader();
      fileReader.onloadend = () => handleFileRead(true, fileReader.result);
      fileReader.readAsText(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const genHrefAttribute = <T,>(city: T) => {
    let data =
      "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(city));
    return "data:" + data;
  };

  return (
    <StyledDrawer variant="permanent" open={open}>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: [1],
        }}
      >
        {open && "Building attributes"}
        <IconButton onClick={toggleDrawer}>
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List dense={true}>
        {open && (
          <div
            style={{
              paddingLeft: "16px",
              paddingRight: "16px",
              paddingTop: "16px",
            }}
          >
            <div className="button">
              {!geojsonFileContents.type ? (
                <Typography gutterBottom>No file loaded</Typography>
              ) : null}
              <Button variant="contained" component="label">
                LOAD GEOJSON
                <input
                  hidden
                  accept=".geojson"
                  onChange={onFileSelectHandler}
                  type="file"
                />
              </Button>
              <Typography>{fileName}</Typography>
            </div>
            <section style={{ marginTop: "16px" }}>
              <Typography variant="h6" gutterBottom>
                Download sample data
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  typography: "body1",
                  "& > :not(style) ~ :not(style)": {
                    ml: 2,
                  },
                }}
              >
                <Link
                  href={genHrefAttribute(heritageTrail)}
                  download="heritageTrail.geojson"
                >
                  Heritage Trail
                </Link>
              </Box>
            </section>

            <Divider variant="middle" />

            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography id="input-slider" variant="h6" gutterBottom>
                Statistiques
              </Typography>
              <MetricDisplay value={landArea} unit="m2" label="Land Area" />
              <MetricDisplay
                value={buildingArea}
                unit="m2"
                label="Building Area"
              />
              <MetricDisplay
                value={buildingArea}
                unit="m2"
                label="Building Floor Area"
              />
              <MetricDisplay value={volume} unit="m3" label="Volume" />
              <MetricDisplay
                value={buildingHeight}
                unit="m"
                label="Building Height"
              />
            </Box>
          </div>
        )}
      </List>
    </StyledDrawer>
  );
};
