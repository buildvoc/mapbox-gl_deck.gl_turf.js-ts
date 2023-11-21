import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
} from "@mui/material";
import { CameraAlt, PinDrop } from "@mui/icons-material";
import StreetviewIcon from "@mui/icons-material/Streetview";
import MapIcon from "@mui/icons-material/Map";
import styled from "@emotion/styled";

const StyledIconButton = styled(IconButton)`
  position: absolute;
  right: 2px;
  bottom: 2px;
`;

interface BottomNavProps {
  value: number;
  view: "firstPerson" | "map";
  onChange: (newValue: number) => void;
  onViewToggle: () => void;
}

export const BottomNav = ({ value, view, onChange, onViewToggle }: BottomNavProps) => {
  return (
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
        <StyledIconButton size="large" color="secondary" onClick={onViewToggle}>
          {view === 'firstPerson' && <StreetviewIcon fontSize="inherit" />}
          {view === 'map' && <MapIcon fontSize="inherit" />}
        </StyledIconButton>
      )}
    </Paper>
  );
};
