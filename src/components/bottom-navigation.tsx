import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Box,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { CameraAlt, PinDrop } from "@mui/icons-material";
import StreetviewIcon from "@mui/icons-material/Streetview";
import MapIcon from "@mui/icons-material/Map";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { NginxFile } from "../types/nginx";
import { LAZ_FILES_LIST_URL } from "../constants";

const StyledIconButton = styled(IconButton)`
  position: absolute;
  right: 2px;
  bottom: 2px;
`;

interface BottomNavProps {
  value: number;
  view: "firstPerson" | "map";
  lazFile: NginxFile | null;
  onChange: (newValue: number) => void;
  onViewToggle: () => void;
  onLazChange: (url: NginxFile) => void;
  drawLaz: () => void;
}

export const BottomNav = ({
  value,
  view,
  lazFile,
  onChange,
  onViewToggle,
  onLazChange,
  drawLaz
}: BottomNavProps) => {
  const [lazList, setLazList] = useState<NginxFile[]>([]);

  useEffect(() => {
    const getLazFilesList = async() => {
      const response = await fetch(LAZ_FILES_LIST_URL);
      const result = await response.json();
      setLazList(result as NginxFile[]);
    }
    getLazFilesList();
  }, []);

  const onLazChangeHandler = (event: SelectChangeEvent) => {
    const file = lazList.find((file) => file.name === event.target.value);
    if (file) {
      onLazChange(file);
    }
  };

  return (
    <>
      {value === 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100vw",
            position: "absolute",
            bottom: "60px",
            paddingLeft: "56px",
          }}
        >
          <Paper sx={{ flexBasis: "200px", padding: "9px" }}>
            <Stack
              direction={"row"}
              spacing={0.5}
              sx={{ minWidth: "200px", maxWidth: "calc(100vw - 80px)" }}
            >
              <Button onClick={drawLaz}>Draw</Button>
              <FormControl fullWidth size="small">
                <InputLabel id="select-laz">Laz file</InputLabel>
                <Select
                  labelId="select-laz"
                  value={lazFile?.name || ""}
                  label="Laz file"
                  onChange={onLazChangeHandler}
                >
                  {lazList.map((file) => (
                    <MenuItem key={file.name} value={file.name}>
                      {file.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>
        </Box>
      )}
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => onChange(newValue)}
        >
          <BottomNavigationAction label="Capture" icon={<CameraAlt />} />
          <BottomNavigationAction label="Result" icon={<PinDrop />} />
        </BottomNavigation>
        {value === 1 && (
          <StyledIconButton
            size="large"
            color="secondary"
            onClick={onViewToggle}
          >
            {view === "firstPerson" && <StreetviewIcon fontSize="inherit" />}
            {view === "map" && <MapIcon fontSize="inherit" />}
          </StyledIconButton>
        )}
      </Paper>
    </>
  );
};
