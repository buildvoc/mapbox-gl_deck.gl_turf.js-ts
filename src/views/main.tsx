import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { CameraAlt, Close, DocumentScanner, PinDrop } from '@mui/icons-material';

import ExifReader from 'exifreader';
import { Container, Divider, Grid, IconButton, List, ListItem, ListItemText, Stack, Toolbar, Drawer, Backdrop, CircularProgress, Snackbar, Alert } from "@mui/material";

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MapResult from "./map-result";

export default function Main() {
  const [value, setValue] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  const [selectedImg, setSelectedImg] = useState<string|null|undefined>(undefined);
  const [previewImg, setPreviewImg] = useState<string|null|undefined>(undefined);

  useEffect(() => {
    (ref.current as HTMLDivElement).ownerDocument.body.scrollTop = 0;
  }, [value]);

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const ImageSrc = styled('span')({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
  });
  const ImageBackdrop = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create('opacity'),
  }));

  const [extractedDraweOpen, setExtractedDrawerOpen] = useState<boolean>(false);
  const toggleExtractedDrawer = (open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
        return;
        }
        setExtractedDrawerOpen(open);
  };
  const onChangeInput = (e: any) => {
    if (!e.target.files || e.target.files.length === 0) {
        setSelectedImg(undefined)
        return
    }
    setSelectedImg(e.target.files[0])
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<any>();
  useEffect(() => {
    if (!selectedImg) {
        setPreviewImg(undefined)
        return
    }
    handleImage(selectedImg);
    const objectUrl = URL.createObjectURL(selectedImg as any)
    setPreviewImg(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImg]);

  const handleImage = async (img: any) => {
    try {
        setLoading(true);
        const tags = await ExifReader.load(img);
        delete tags['MakerNote'];
        setTags(tags);
        setExtractedDrawerOpen(true);
        if (tags?.GPSLatitude?.description && tags?.GPSLongitude?.description){
            getPolygon(tags.GPSLatitude.description, tags.GPSLongitude.description);
        }else{
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
  }

  const tagLists = tags && Object.keys(tags).map((keyName: any, i: any) => 
     <ListItem key={i}>
        <ListItemText primary={Array.isArray(tags[keyName]) ? tags[keyName].map((item: any) => item.description).join(', '): tags[keyName]?.description || '-'} secondary={keyName} />
     </ListItem>
  )

  const [errMsg, setErrMsg] = useState<any>();
  const [geo, setGeo] = useState<any>();
  const getPolygon = async (lat: string, lon: string) => {
    try {
        setLoading(true);
        setErrMsg(null);
        let lng = parseFloat(lon);
        if (lng > 0) lng = -Math.abs(parseFloat(lon));

        const response = await fetch("https://api.buildingshistory.co.uk/api/v1/layer-sx/nearest?latitude="+parseFloat(lat)+"&longitude="+lng);
        const data = await response.json();

        if (data.data.layer_sx.length > 0 && data.data.layer_sx[0].geojson) {
            // loadPolygon(data.data.layer_sx[0].geojson, parseFloat(lat), lng);
            // $("#RelHMax").text(data.data.layer_sx[0].rel_h_max + " m");
            console.log(data.data.layer_sx[0].geojson);
            
            setGeo(data.data.layer_sx[0].geojson)
            setValue(1)

        }else{
            alert('No records found in our database');
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
  }

  

  return (
    <Box sx={{ display: 'flex', height: '100vh'}} ref={ref}>
      <CssBaseline />

      {value === 0 ? (
      <>
      <Drawer 
        anchor={'left'}
        onClose={toggleExtractedDrawer(false)}
        open={extractedDraweOpen}
        >
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            Extracted Metadata
            <IconButton onClick={toggleExtractedDrawer(false)}>
              {<Close />}
            </IconButton>
          </Toolbar>
          <Divider />
          <List sx={{ width: 300, maxWidth: 300, bgcolor: 'background.paper' }}>
            {tagLists && tagLists}
          </List>
      </Drawer>
      <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Container >
            <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                sx={{height: '100vh'}}
                >
                {selectedImg && (
                  <>
                    <ImageSrc style={{ backgroundImage:`url(${previewImg})` }} />
                    <ImageBackdrop className="MuiImageBackdrop-root" />
                  </>
                )}
                
                <Stack spacing={2} direction="column">
                    <Button component="label" variant="contained" startIcon={<CameraAlt />}>
                        {selectedImg ? 'Take again' :'Take a picture'} <VisuallyHiddenInput onChange={onChangeInput} type="file" accept="image/*" capture />
                    </Button>  
                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                        {selectedImg ? 'Upload again' :'Upload image'} <VisuallyHiddenInput onChange={onChangeInput} type="file" accept="image/*" />
                    </Button>
                    {selectedImg && tags && (
                      <Button component="label" variant="outlined" startIcon={<DocumentScanner />} onClick={toggleExtractedDrawer(true)}>
                        {'Metadata results'}
                      </Button>
                    )}
                </Stack>
            </Grid>
          </Container>
      </Box>
      </>
      ): <MapResult geojson={geo} />}

      <Paper sx={{ position: 'fixed',  bottom: 0, left:0, right: 0 }} elevation={3}>
            <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            >
            <BottomNavigationAction label="Capture" icon={<CameraAlt />} />
            <BottomNavigationAction label="Result" icon={<PinDrop />} />
            </BottomNavigation>
      </Paper>

      <Snackbar open={errMsg} autoHideDuration={6000}>
        <Alert severity="success" sx={{ width: '100%' }}>
          {errMsg}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
        >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
