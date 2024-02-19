import { useEffect, useState, useRef } from 'react';
import './App.css';
import VideoInformation from './components/Video-information';
import {
  Button,
  Box,
  Toolbar,
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { Header } from './components/Header';

const useVideoRef = () => {
  const videoComponentRef = useRef(null);
  const [disabledPlayButton, setDisabledPlayButton] = useState(true);

  return {
    videoComponentRef,
    disabledPlayButton,
    setDisabledPlayButton
  }
}

function App() {
  const videoComponent = useVideoRef();
  const [isPLaying, setIsPlaying] = useState(false);
  const [videoChanged, setVideoChanged] = useState(false);

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

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Toolbar />

        <div className='title-content'>
          <h1 className='text-gradient'>VEHICLE DETECTION</h1>
          <h2>CUSTOM VISION</h2>
        </div>

        <div className='main-container'>

          <VideoInformation
            setIsPlaying={setIsPlaying}
            disabledPlayButton={videoComponent.setDisabledPlayButton}
            setVideoChanged={setVideoChanged}
            ref={videoComponent.videoComponentRef}
          />

          <div className="button-container">
            {!isPLaying ?
              <Button variant="contained" startIcon={<PlayArrow />} onClick={handlePlayVideo}
                disabled={videoComponent.disabledPlayButton}>
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

        </div>

      </Box>
    </Box>
  );
}

export default App;
