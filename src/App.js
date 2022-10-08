import { useEffect, useState, useRef, useReducer } from 'react';
import * as cvstfjs from '@microsoft/customvision-tfjs';
import './App.css';
import {
  Button,
  CircularProgress,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Slider
} from '@mui/material';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import PlayArrow from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TrafficIcon from '@mui/icons-material/Traffic';

import VideoInformation from './components/Video-information';

function App() {
  const [isPLaying, setIsPlaying]                     = useState(false);
  const [disabledPlayButton, setDisabledPlayButton]   = useState(true);
  const [disabledPlayButton2, setDisabledPlayButton2] = useState(true);
  const videoComponentRef                             = useRef(null)
  const videoComponentRef2                            = useRef(null)
  const [videoChanged, setVideoChanged]               = useState(false);

  useEffect(() => {
    handleResetPredict();
    setVideoChanged(false);
  }, [videoChanged]);

  
  const handlePlayVideo = () => {
    videoComponentRef.current.playVideo();
    videoComponentRef2.current.playVideo();
  }

  const handlePauseVideo = () => {
    videoComponentRef.current.pauseVideo();
    videoComponentRef2.current.pauseVideo();
  }

  const handleResetPredict = () => {
    videoComponentRef.current.resetPredict();
    videoComponentRef2.current.resetPredict();
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <h3>Vehicle Detection</h3>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
      >
        <Toolbar />

        <div className='main-container'>

          <VideoInformation 
            setIsPlaying={setIsPlaying}
            disabledPlayButton={setDisabledPlayButton}
            setVideoChanged={setVideoChanged}
            ref={videoComponentRef}
            />

          <div className="button-container">
            { !isPLaying ? 
              <Button variant="contained" startIcon={<PlayArrow />} onClick={handlePlayVideo} 
              disabled={ disabledPlayButton || disabledPlayButton2 }>
                Play
              </Button> :
              <Button variant="contained" startIcon={<PauseIcon />} onClick={handlePauseVideo}>
                Pause
              </Button> 
            }      
              <Button variant="contained" onClick={handleResetPredict}>
                Reset
              </Button>   
          </div>

          <VideoInformation 
            ref={videoComponentRef2}
            setIsPlaying={setIsPlaying}
            setVideoChanged={setVideoChanged}
            disabledPlayButton={setDisabledPlayButton2}
          />
          
        </div>

      </Box>
    </Box>
  );
}

export default App;
