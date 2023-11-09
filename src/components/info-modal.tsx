import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Modal,
  Typography,
} from "@mui/material";

const infoStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #f5f5f5",
  overflow: "auto",
  boxShadow: 24,
  p: 4,
};

interface InfoModalProps {
  infoOpen: boolean;
  toggleInfo: () => void;
}

export const InfoModal = ({ infoOpen, toggleInfo }: InfoModalProps) => {
  return (
    <Modal
      open={infoOpen}
      onClose={toggleInfo}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={infoStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Identify building height from a photo
        </Typography>
        <Typography
          paragraph
          variant={"caption"}
          id="modal-modal-description"
          sx={{ mt: 2 }}
        >
          Building-Height is a system that can determine the attributes of
          historical buildings in England. The building part can be defined just
          by uploading a photo.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <List dense={true}>
              <ListItem sx={{ paddingLeft: 0 }}>
                <ListItemText
                  primary="1. Upload an image"
                  secondary={
                    "You can upload or capture from your camera with active GPS"
                  }
                />
              </ListItem>
              <ListItem sx={{ paddingLeft: 0 }}>
                <ListItemText
                  primary="2. Image metadata will be displayed"
                  secondary={
                    "Extracted metadata from the image you uploaded will be displayed"
                  }
                />
              </ListItem>
              <ListItem sx={{ paddingLeft: 0 }}>
                <ListItemText
                  primary="3. Building height will be identified"
                  secondary={
                    "The building height, map location of the building and its attributes will be displayed"
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
        <Button
          onClick={toggleInfo}
          sx={{ mt: 4, float: "right" }}
          variant="outlined"
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};
