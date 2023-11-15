import { useEffect, useMemo, useState } from "react";
import { CameraAlt, Close, DocumentScanner } from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Toolbar,
  styled,
} from "@mui/material";

const ImageBackdrop = styled("span")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create("opacity"),
}));

const ImageSrc = styled("span")({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: "cover",
  backgroundPosition: "center 40%",
});

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface Tag {
  description?: string;
}

interface PhotoViewProps {
  tags: Record<string, Tag[] | Tag>;
  selectedImg: string | null | undefined;
  extractedDrawerOpen: boolean;
  onImageChange: (value: string | null | undefined) => void;
  setExtractedDrawerOpen: (value: boolean) => void;
}

export const PhotoView = ({
  tags,
  selectedImg,
  extractedDrawerOpen,
  onImageChange,
  setExtractedDrawerOpen,
}: PhotoViewProps) => {
  const [previewImg, setPreviewImg] = useState<string | null | undefined>(
    undefined
  );
  useEffect(() => {
    if (!selectedImg) {
      setPreviewImg(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedImg as any);
    setPreviewImg(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImg]);

  const toggleExtractedDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setExtractedDrawerOpen(open);
    };

  const onImageChangeHandler = (e: any) => {
    if (!e.target.files || e.target.files.length === 0) {
      onImageChange(undefined);
      return;
    }
    onImageChange(e.target.files[0]);
  };

  const tagLists = useMemo(() => {
    if (!tags) {
      return null;
    }
    return Object.keys(tags).map((keyName: any, i: any) => (
      <ListItem key={i}>
        <ListItemText
          primary={
            Array.isArray(tags[keyName])
              ? (tags[keyName] as Tag[])
                  .map((item: any) => item.description)
                  .join(", ")
              : (tags[keyName] as Tag)?.description || "-"
          }
          secondary={keyName}
        />
      </ListItem>
    ));
  }, [tags]);

  console.log(previewImg);
  return (
    <>
      <Drawer
        anchor={"left"}
        onClose={toggleExtractedDrawer(false)}
        open={extractedDrawerOpen}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: [1],
          }}
        >
          Extracted Metadata
          <IconButton onClick={toggleExtractedDrawer(false)}>
            {<Close />}
          </IconButton>
        </Toolbar>
        <Divider />
        <List
          dense={true}
          sx={{ width: 300, maxWidth: 300, bgcolor: "background.paper" }}
        >
          {tagLists}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Container>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{ height: "100vh" }}
          >
            {selectedImg && (
              <>
                <ImageSrc style={{ backgroundImage: `url(${previewImg})` }} />
                <ImageBackdrop className="MuiImageBackdrop-root" />
              </>
            )}

            <Stack spacing={2} direction="column">
              <Button
                component="label"
                variant="contained"
                startIcon={<CameraAlt />}
              >
                {selectedImg ? "Take again" : "Take a picture"}{" "}
                <VisuallyHiddenInput
                  onChange={onImageChangeHandler}
                  type="file"
                  accept="image/*"
                  capture
                />
              </Button>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                {selectedImg ? "Upload again" : "Upload image"}{" "}
                <VisuallyHiddenInput
                  onChange={onImageChangeHandler}
                  type="file"
                  accept="image/*"
                />
              </Button>
              {selectedImg && tags && (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<DocumentScanner />}
                  onClick={toggleExtractedDrawer(true)}
                >
                  {"Metadata results"}
                </Button>
              )}
            </Stack>
          </Grid>
        </Container>
      </Box>
    </>
  );
};