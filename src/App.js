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
import FileUploadIcon from '@mui/icons-material/FileUpload'
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import PlayArrow from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import TrafficIcon from '@mui/icons-material/Traffic';
import { SettingsSuggest } from '@mui/icons-material';

const drawerWidth = 400;
const width = 500;
const height = 350;

function App() {

  // general
  const internalThresholdValue                = useRef(0.50);
  const finishPredicting                      = useRef(false); // control recursion

  // Controls for video 1 
  const model                                 = useRef(null);
  const inputRef                              = useRef(null);
  const videoRef                              = useRef(null);
  const [isPLaying, setIsPlaying]             = useState(false);
  const canvasRef                             = useRef(null);
  const canvasValidZone                       = useRef(null);
  const validArea                             = useRef({x1: 0, y1:0, x2: 0, y2: 0});
  const [file, setFile]                       = useState();
  const [fileURL, setFileURL]                 = useState('');
  const disabledPlayButton                    = useRef(true);
  const previousNumberVehicles                = useRef(0);
  const [numberVehicles, setNumberVehicles]   = useState(0);
  const internalNumberVehicles                = useRef(0);
  const [greenTime, setGreenTime]             = useState(0);
  
  // controls for video 2
  const model2                                = useRef(null);
  const inputRef2                             = useRef(null);
  const videoRef2                             = useRef(null);
  // const [isPLaying2, setIsPlaying2]           = useState(false);
  const canvasRef2                            = useRef(null);
  const canvasValidZone2                      = useRef(null);
  const validArea2                            = useRef({x1: 0, y1:0, x2: 0, y2: 0});
  const [file2, setFile2]                     = useState();
  const [fileURL2, setFileURL2]               = useState('');
  const disabledPlayButton2                   = useRef(true);
  const previousNumberVehicles2               = useRef(0);
  const [numberVehicles2, setNumberVehicles2] = useState(0);
  const internalNumberVehicles2               = useRef(0);
  const [greenTime2, setGreenTime2]           = useState(0);
  
  
  
  useEffect(() => {
    loadModel("model.json")
    loadModel2("model.json") // best option for performance
  }, []);

  useEffect(() => {
    if (file) {
      const fileReader = new FileReader();
      fileReader.onloadend = (() => {
        setFileURL(fileReader.result);
        disabledPlayButton.current = false; // TODO: fix
      })
      fileReader.readAsDataURL(file);
    }
  }, [file]);

  // TODO: refactor
  useEffect(() => {
    if (file2) {
      const fileReader = new FileReader();
      fileReader.onloadend = (() => {
        setFileURL2(fileReader.result);
        disabledPlayButton2.current = false; // TODO: fix
      })
      fileReader.readAsDataURL(file2);
    }
  }, [file2])


  const loadModel = async (path) => {
    model.current = new cvstfjs.ObjectDetectionModel();
    await model.current.loadModelAsync(path);
  };

  // TODO: refactor
  const loadModel2 = async (path) => {
    model2.current = new cvstfjs.ObjectDetectionModel();
    await model2.current.loadModelAsync(path);
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

    if (countCurrentVehicles > previousNumberVehicles.current) {
      internalNumberVehicles.current++;
    }
    previousNumberVehicles.current = countCurrentVehicles;
    setNumberVehicles(internalNumberVehicles.current);
    
    semaphoreTimeLogic();
  }

  // TODO: refactor
  const showDetectItemsOnCanvas2 = (results) => {
    const canvas = canvasRef2.current;
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
        if (rectX >= validArea2.current.x1 && rectX <= validArea2.current.x2 && rectY >= validArea2.current.y1) {
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

    if (countCurrentVehicles > previousNumberVehicles2.current) {
      internalNumberVehicles2.current++;
    }
    previousNumberVehicles2.current = countCurrentVehicles;
    setNumberVehicles2(internalNumberVehicles2.current);
    
    semaphoreTimeLogic();
  }

  const semaphoreTimeLogic = () => {
    if (videoRef.current.currentTime >= 10) { // TODO: fix for video 2 and playbackRate
      // number of vehicles is equal to semaphore time (set time)
      // TODO: refactor
      setGreenTime(internalNumberVehicles.current * 2);
      setGreenTime2(internalNumberVehicles2.current * 2);
      pauseVideo();      
    }
  };

  const predict = async () => {
    const data = videoRef.current;
    const results = await model.current.executeAsync(data);
    showDetectItemsOnCanvas(results);
    const velocityRender = 10; // ms
    if (!finishPredicting.current) // finish recursivity
      setTimeout(predict, velocityRender);
  };
  
  // TODO: refactor
  const predict2 = async () => {
    const data = videoRef2.current;
    const results = await model2.current.executeAsync(data);
    showDetectItemsOnCanvas2(results);
    const velocityRender = 10; // ms
    if (!finishPredicting.current) // finish recursivity
      setTimeout(predict2, velocityRender);
  };


  const playVideo = () => {
    finishPredicting.current = false;
    // TODO: refactor 
    videoRef.current.playbackRate  = 0.5;
    videoRef2.current.playbackRate  = 0.5;

    predict();
    predict2();
    videoRef.current.play();
    videoRef2.current.play();
    setIsPlaying(true);
  }

  const pauseVideo = () => {
    finishPredicting.current = true;
    videoRef.current.pause();
    videoRef2.current.pause();
    setIsPlaying(false);
  }

  const resetPredict = () => {
    finishPredicting.current = true;

    // reset video
    videoRef.current.currentTime = 0;
    videoRef2.current.currentTime = 0;
    pauseVideo();

    // set values
    previousNumberVehicles.current = 0;
    previousNumberVehicles2.current = 0;
    setNumberVehicles(0);
    setNumberVehicles2(0);
    internalNumberVehicles.current = 0;
    internalNumberVehicles2.current = 0;
    setGreenTime(0);
    setGreenTime2(0);

    // clear canvas:
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const canvas2 = canvasRef2.current;
    const  ctx2 = canvas2.getContext('2d');
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    
  }

  const onLoadFile = (e) => {
    setFile(e.target.files[0]);
    // control recursivity clearCanvas
    finishPredicting.current = true;
    pauseVideo();
  }

  // TODO: refactor
  const onLoadFile2 = (e) => {
    setFile2(e.target.files[0]);
    // control recursivity clearCanvas
    finishPredicting.current = true;
    pauseVideo();
  }

  const onClickValidArea = (e) => {
    const canvas = canvasValidZone.current;
    
    validArea.current.x1 = e.clientX - canvas.getBoundingClientRect().left
    validArea.current.y1 = e.clientY - canvas.getBoundingClientRect().top;
    validArea.current.y2 = validArea.current.y1; // horizantal
  }

  // TODO: refactor
  const onClickValidArea2 = (e) => {
    const canvas = canvasValidZone2.current;
    
    validArea2.current.x1 = e.clientX - canvas.getBoundingClientRect().left
    validArea2.current.y1 = e.clientY - canvas.getBoundingClientRect().top;
    validArea2.current.y2 = validArea2.current.y1; // horizantal
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

  // TODO: refactor 
  const showValidAreaOnCanvas2 = (e) => {
    if (e.buttons === 0) return;
    
    const canvas = canvasValidZone2.current;
    const ctx = canvas.getContext('2d');
    
    // get position relative to canvas
    validArea2.current.x2 = e.clientX - canvas.getBoundingClientRect().left;
    
    ctx.strokeStyle = 'red'
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(
      validArea2.current.x1, 
      validArea2.current.y1, 
      validArea2.current.x2 - validArea2.current.x1, // this fixes to drawn as line
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
            <div className="video">
              <video id='video' muted loop
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
            
            <div className="information">
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
              <p>Static Time: 20</p>
              <p>Dynamic Time: { greenTime }</p>
              <p>Number of vehicles: { numberVehicles }</p>
            </div>
          </div>

          <div className="button-container">
            { !isPLaying ? 
              <Button variant="contained" startIcon={<PlayArrow />} onClick={playVideo} 
                      disabled={ disabledPlayButton.current && disabledPlayButton2.current }>
                Play
              </Button> :
              <Button variant="contained" startIcon={<PauseIcon />} onClick={pauseVideo}>
                Pause
              </Button> 
            }      
              <Button variant="contained" onClick={resetPredict}>
                RESET
              </Button>   
          </div>


          <div className='video-container'>
            <div className="video">
              <video id='video' muted loop
                src={fileURL2}
                ref={videoRef2}
                width={width} 
                height={height}
              />
              <canvas
                ref={canvasRef2}
                width={width} 
                height={height}
              />
              <canvas className="interact"
                onMouseMove={showValidAreaOnCanvas2}
                onMouseDown= {onClickValidArea2}
                ref={canvasValidZone2}
                width={width} 
                height={height}
              />
            </div>
            
            <div className="information">
              <Button variant="contained" component="label" startIcon={<FileUploadIcon />}>
                Select File
                <input
                  hidden
                  type="file"
                  accept='video/mp4'
                  ref={inputRef2}
                  onChange={onLoadFile2}
                />
              </Button>
              <p>Static Time: 20</p>
              <p>Dynamic Time: { greenTime2 }</p>
              <p>Number of vehicles: { numberVehicles2 }</p>
            </div>
          </div>


        </div>
        {/* end content */}
      </Box>
    </Box>
  );
}

export default App;
