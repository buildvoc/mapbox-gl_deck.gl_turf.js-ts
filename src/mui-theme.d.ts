import "@mui/material/styles/createPalette";

declare module "@mui/material/Badge" {
  interface BadgePropsColorOverrides {
    disabled: true;
  }
}
