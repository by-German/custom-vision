import { useEffect, useState, useRef } from 'react';
import './App.css';
import VideoInformation from './components/Video-information';
import {
  Button,
  Box,
  Toolbar,
  Slider,
  List,
  ListItemText,
  ListItem,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import { Header } from './components/Header';



const useVideoRef = () => {
  const videoComponentRef = useRef(null);
  const [disabledPlayButton, setDisabledPlayButton] = useState(true);

  return {
    videoComponentRef,
    disabledPlayButton,
    setDisabledPlayButton,
  }
}

function App() {
  const videoComponent = useVideoRef();
  const [isPLaying, setIsPlaying] = useState(false);
  const [videoChanged, setVideoChanged] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(0.75);

  useEffect(() => {
    handleResetPredict();
    setVideoChanged(false);
  }, [videoChanged]);

  const handlePlayVideo = () => {
    videoComponent.videoComponentRef.current.playVideo();
  }

  const handlePauseVideo = () => {
    videoComponent.videoComponentRef.current.pauseVideo();
  }

  const handleResetPredict = () => {
    videoComponent.videoComponentRef.current.resetPredict();
  }

  const handleThresholdValue = (e, value) => {
    setThresholdValue(value);
    videoComponent.videoComponentRef.current.setInternalThresholdValue(value);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />

        <div className='title-content'>
          <h1 className='text-gradient'>VEHICLE DETECTION</h1>
          <h2>CUSTOM VISION</h2>
          <p>*Important: Activate hardware acceleration in your browser settings</p>
        </div>

        <div className='main-container'>

          <VideoInformation
            setIsPlaying={setIsPlaying}
            disabledPlayButton={videoComponent.setDisabledPlayButton}
            setVideoChanged={setVideoChanged}
            thresholdValue={thresholdValue}
            ref={videoComponent.videoComponentRef}
          />

          <div className="video-controllers">
            <h3>Controllers</h3>

            <List>
              <ListItem>
                <ListItemIcon >
                  <TimeToLeaveIcon style={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ style: { color: 'white' } }}
                  secondaryTypographyProps={{ style: { color: 'white' } }}
                  primary="Threshold value"
                  secondary={thresholdValue} />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                </ListItemIcon>
                <Slider
                  value={thresholdValue}
                  step={0.01}
                  min={0.01}
                  max={0.99}
                  valueLabelDisplay="auto"
                  style={{ color: '#ada5cd' }}
                  onChange={handleThresholdValue}
                />
              </ListItem>
            </List>

            <div className="button-container">
              <Button
                variant={videoComponent.disabledPlayButton ? "outlined" : "contained"}
                startIcon={!isPLaying ? <PlayArrow /> : <PauseIcon />}
                onClick={!isPLaying ? handlePlayVideo : handlePauseVideo}
                disabled={videoComponent.disabledPlayButton}
                style={{
                  color: videoComponent.disabledPlayButton ?
                    '#959595' : undefined, // Color del texto cuando está deshabilitado
                  backgroundColor: videoComponent.disabledPlayButton ?
                    'transparent' : '#9366cb', // Color cuando está deshabilitado
                  borderColor: videoComponent.disabledPlayButton ?
                    '#303030' : undefined, // Color del borde cuando está deshabilitado
                }}>
                {!isPLaying ? 'Start' : 'Pause'}
              </Button>
              <Button
                variant="outlined"
                style={{ borderColor: '#ada5cd', color: '#ada5cd'}}
                onClick={handleResetPredict}>
                Reset
              </Button>
            </div>
          </div>

        </div>

      </Box>
    </Box>
  );
}

export default App;
