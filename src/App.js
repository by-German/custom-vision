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
import TrafficIcon from '@mui/icons-material/Traffic';


const drawerWidth = 400;
const width = 600;
const height = 400;

function App() {

  const model                                 = useRef(null);
  const inputRef                              = useRef(null);
  const videoRef                              = useRef(null);
  const canvasRef                             = useRef(null);
  const canvasValidZone                       = useRef(null);
  const validArea                             = useRef({x1: 0, y1:0, x2: 0, y2: 0});
  // const validArea                             = useRef({x1: 125, y1:81, x2: 589, y2: 81});
  const internalThresholdValue                = useRef(0.15); // TODO: user preferences
  const previousNumberVehicles                = useRef(0);
  const [file, setFile]                       = useState();
  const [fileURL, setFileURL]                 = useState('');
  const [thresholdValue, setthresholdValue]   = useState(0.15);  // TODO: user preferences
  const [numberVehicles, setNumberVehicles]   = useState(0);
  const internalNumberVehicles                = useRef(0);

  useEffect(() => {
    loadModel("model.json")
  }, []);

  useEffect(() => {
    if (file) {
      const fileReader = new FileReader();
      fileReader.onloadend = (() => {
        setFileURL(fileReader.result);
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
        
        if (rectX >= validArea.current.x1 &&  
            rectX <= validArea.current.x2 &&
            rectY >= validArea.current.y1) {
          // drawn on canvas
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'red';
          countCurrentVehicles++;
        } 
        else {
          // drawn on canvas
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

  }

  const predict = async () => {
    const data = videoRef.current;
    const results = await model.current.executeAsync(data);
    const velocityRender = 10; // ms
    showDetectItemsOnCanvas(results);
    // TODO: add conditional for to control when the video is finished
    setTimeout(predict, velocityRender);
  };

  const onLoadFile = (e) => {
    setFile(e.target.files[0]);
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
            <video id='video' autoPlay muted loop // controls
              // poster='path.img'
              src={fileURL}
              ref={videoRef}
              width={width} 
              height={height}
              onPlay={predict} // to use when will be removed button predict
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
            
            <Button variant="contained" startIcon={<PlayArrow />}>
              Play
            </Button>
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
            {/* <Button variant="contained" onClick={predict}>
              Execute
            </Button> */}
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
          <Divider></Divider>
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
            <ListItemText primary="Number of vehicles" secondary={"value " + numberVehicles} />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
}

export default App;
