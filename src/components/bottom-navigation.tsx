import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { CameraAlt, PinDrop } from "@mui/icons-material";

interface BottomNavProps {
  value: number;
  onChange: (newValue: number) => void;
}

export const BottomNav = ({ value, onChange }: BottomNavProps) => {
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
    </Paper>
  );
};
