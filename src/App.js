import { useEffect, useState, useRef } from 'react';
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
import FileUploadIcon from '@mui/icons-material/FileUpload'
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import PlayArrow from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TrafficIcon from '@mui/icons-material/Traffic';

const drawerWidth = 400;
const width = 600;
const height = 400;

function App() {

  const model                                 = useRef(null);
  const inputRef                              = useRef(null);
  const videoRef                              = useRef(null);
  const [isPLaying, setIsPlaying]             = useState(false);
  const finishPredicting                      = useRef(false);
  const disabledPlayButton                    = useRef(true);
  const canvasRef                             = useRef(null);
  const canvasValidZone                       = useRef(null);
  const validArea                             = useRef({x1: 0, y1:0, x2: 0, y2: 0});
  const internalThresholdValue                = useRef(0.15);
  const previousNumberVehicles                = useRef(0);
  const [file, setFile]                       = useState();
  const [fileURL, setFileURL]                 = useState('');
  const [thresholdValue, setthresholdValue]   = useState(0.15);
  const [numberVehicles, setNumberVehicles]   = useState(0);
  const internalNumberVehicles                = useRef(0);
  const [greenTime, setGreenTime]             = useState(0);

  useEffect(() => {
    loadModel("model.json")
  }, []);

  useEffect(() => {
    if (file) {
      const fileReader = new FileReader();
      fileReader.onloadend = (() => {
        setFileURL(fileReader.result);
        disabledPlayButton.current = false;
      })
      fileReader.readAsDataURL(file);
    }
  }, [file]);

  const loadModel = async (path) => {
    model.current = new cvstfjs.ObjectDetectionModel();
    await model.current.loadModelAsync(path);
  };

  const showDetectItemsOnCanvas = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let countCurrentVehicles = 0;
    
    for (let i = 0; i < results[0].length; i++) {
      const [x1, y1, x2, y2]  = results[0][i];
      const probability       = results[1][i];
      // const tag            = results[2][i];

      if (probability >= internalThresholdValue.current) { 
        const [rectX, rectY]          = [x1 * width, y1 * height];
        const [rectWith, rectHeight]  = [x2 * width - rectX, y2 * height - rectY]
        
        // limit vehicle count detection area
        if (rectX >= validArea.current.x1 && rectX <= validArea.current.x2 && rectY >= validArea.current.y1) {
          // drawn on canvas when is detected
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'red';
          countCurrentVehicles++;
        } 
        else {
          // drawn on canvas when is not detected
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'cyan';
        }
        ctx.strokeRect(rectX, rectY, rectWith, rectHeight);
      }
    }

    // TODO: set to fuction: set logic count vehicles 
    if (countCurrentVehicles > previousNumberVehicles.current) {
      internalNumberVehicles.current++;
    }
    previousNumberVehicles.current = countCurrentVehicles;
    setNumberVehicles(internalNumberVehicles.current);
    
    semaphoreTimeLogic(10);
  }

  const semaphoreTimeLogic = (seconds) => {
    if (videoRef.current.currentTime >= seconds) { // execute every 30 secs
      // number of vehicles is equal to semaphore time (set time)
      setGreenTime(internalNumberVehicles.current);
      videoRef.current.pause(); // pause video
    }

  };

  const predict = async () => {
    const data = videoRef.current;
    const results = await model.current.executeAsync(data);
    const velocityRender = 10; // ms
    showDetectItemsOnCanvas(results);
    if (!finishPredicting.current) // finish recursivity
      setTimeout(predict, velocityRender);
  };
  
  const playVideo = () => {
    finishPredicting.current = false;
    predict();
    videoRef.current.play();
    setIsPlaying(true);
  }

  const pauseVideo = () => {
    finishPredicting.current = true;
    videoRef.current.pause();
    setIsPlaying(false);
  }

  const onLoadFile = (e) => {
    setFile(e.target.files[0]);
    // TODO: control recursivity with "finishPredicting.current = true;" and clearCanvas
  }

  const onClickValidArea = (e) => {
    const canvas = canvasValidZone.current;
    
    validArea.current.x1 = e.clientX - canvas.getBoundingClientRect().left
    validArea.current.y1 = e.clientY - canvas.getBoundingClientRect().top;
    validArea.current.y2 = validArea.current.y1; // horizantal
  }

  const showValidAreaOnCanvas = (e) => {
    if (e.buttons === 0) return;
    
    const canvas = canvasValidZone.current;
    const ctx = canvas.getContext('2d');
    
    // get position relative to canvas
    validArea.current.x2 = e.clientX - canvas.getBoundingClientRect().left;
    
    ctx.strokeStyle = 'blue'
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(
      validArea.current.x1, 
      validArea.current.y1, 
      validArea.current.x2 - validArea.current.x1, // this fixes to drawn as line
      0  // this fixes to draw as line height = 0
    );
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

        {/* start content */}
        <div className='main-container'>

          <div className='video-container'>
            <video id='video' muted loop
              // poster='path.img'
              src={fileURL}
              ref={videoRef}
              width={width} 
              height={height}
            />
            <canvas
              ref={canvasRef}
              width={width} 
              height={height}
            />
            <canvas className="interact"
              onMouseMove={showValidAreaOnCanvas}
              onMouseDown= {onClickValidArea}
              ref={canvasValidZone}
              width={width} 
              height={height}
            />
          </div>

          <div className="button-container">
            
            { !isPLaying ? 
              <Button variant="contained" startIcon={<PlayArrow />} onClick={playVideo} disabled={disabledPlayButton.current} >
                Play
              </Button> :
              <Button variant="contained" startIcon={<PauseIcon />} onClick={pauseVideo}>
                Pause
              </Button> 
            }            

            <Button variant="contained" component="label" startIcon={<FileUploadIcon />}>
              Select File
              <input
                hidden
                type="file"
                accept='video/mp4'
                ref={inputRef}
                onChange={onLoadFile}
              />
            </Button>
          </div>

        </div>
        {/* end content */}
      </Box>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="right"
      >
        <Toolbar />
        <List>
          <ListItem>
            <ListItemText primary="Information" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <DataThresholdingIcon />
            </ListItemIcon>
            <ListItemText primary="Data Thresholding" secondary={"value " + thresholdValue} />
          </ListItem>
          <ListItem>
            <ListItemIcon />
            <Slider 
              min={0.0}
              step={0.01}
              max={1.0}
              defaultValue={thresholdValue}
              onChange={(e) => {setthresholdValue(e.target.value); internalThresholdValue.current = e.target.value}} 
              value={thresholdValue}
              valueLabelDisplay="auto"/>
            <ListItemIcon />
          </ListItem>
          <ListItem>
            <ListItemIcon> 
              <TimeToLeaveIcon />
            </ListItemIcon>
            <ListItemText primary="Number of vehicles" secondary={"total " + numberVehicles} />
          </ListItem>
          <ListItem>
            <ListItemIcon> 
              <TrafficIcon />
            </ListItemIcon>
            <ListItemText primary="Green light time" secondary={"time in seconds " + greenTime} />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}

export default App;
