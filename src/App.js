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

  const videoChanged = useRef(false);
  // TODO: if video is changed, then execute handleResetPredict
  // is necessary crete a variable in video component for indicate
  // when video is changed
  // pass videoChanged to video compomnent

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

        {/* start content */}
        <div className='main-container'>

          <VideoInformation 
            setIsPlaying={setIsPlaying}
            disabledPlayButton={setDisabledPlayButton}
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
            disabledPlayButton={setDisabledPlayButton2}
          />
          
        </div>
        {/* end content */}
      </Box>
    </Box>
  );
}

export default App;
