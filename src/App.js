import { useEffect, useState, useRef } from 'react';
import './App.css';
import VideoInformation from './components/Video-information';
import {
  Button,
  Box,
  AppBar,
  Toolbar,
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const useVideoRef = () => {
  const videoComponentRef                           = useRef(null);
  const [disabledPlayButton, setDisabledPlayButton] = useState(true);

  return {
    videoComponentRef,
    disabledPlayButton,
    setDisabledPlayButton
  }
}

function App() {
  const videoComponent                  = [useVideoRef(), useVideoRef()]
  const [isPLaying, setIsPlaying]       = useState(false);
  const [videoChanged, setVideoChanged] = useState(false);

  useEffect(() => {
    handleResetPredict();
    setVideoChanged(false);
  }, [videoChanged]);

  
  const handlePlayVideo = () => {
    videoComponent[0].videoComponentRef.current.playVideo();
    videoComponent[1].videoComponentRef.current.playVideo();
  }

  const handlePauseVideo = () => {
    videoComponent[0].videoComponentRef.current.pauseVideo();
    videoComponent[1].videoComponentRef.current.pauseVideo();
  }

  const handleResetPredict = () => {
    videoComponent[0].videoComponentRef.current.resetPredict();
    videoComponent[1].videoComponentRef.current.resetPredict();
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
            disabledPlayButton={videoComponent[0].setDisabledPlayButton}
            setVideoChanged={setVideoChanged}
            ref={videoComponent[0].videoComponentRef}
            />

          <div className="button-container">
            { !isPLaying ? 
              <Button variant="contained" startIcon={<PlayArrow />} onClick={handlePlayVideo} 
              disabled={ videoComponent[0].disabledPlayButton || videoComponent[1].disabledPlayButton }>
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
            ref={videoComponent[1].videoComponentRef}
            setIsPlaying={setIsPlaying}
            setVideoChanged={setVideoChanged}
            disabledPlayButton={videoComponent[1].setDisabledPlayButton}
          />
          
        </div>

      </Box>
    </Box>
  );
}

export default App;
