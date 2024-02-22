import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import * as cvstfjs from '@microsoft/customvision-tfjs';
import './Video-information.css';
import {
  Button,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload'

const width = 500;
const height = 350;

const VideoInformation = forwardRef((props, ref) => {
  // Controls for video
  const model = useRef(null);
  const finishPredicting = useRef(false); // control recursion
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const setIsPlaying = props.setIsPlaying;
  const canvasRef = useRef(null);
  const canvasValidZone = useRef(null);
  const validArea = useRef({ x1: 0, y1: 0, x2: 0, y2: 0 });
  const [file, setFile] = useState();
  const [fileURL, setFileURL] = useState('');
  const disabledPlayButton = props.disabledPlayButton;
  const setVideoChanged = props.setVideoChanged;

  // manage internal values
  const internalThresholdValue = useRef(props.thresholdValue);

  useImperativeHandle(ref, () => ({
    playVideo,
    resetPredict,
    pauseVideo,
    setInternalThresholdValue,
  }))

  const setInternalThresholdValue = (value) => {
    internalThresholdValue.current = value;
  }

  useEffect(() => {
    loadModel("model.json")
  }, []);

  useEffect(() => {
    if (file) {
      const fileReader = new FileReader();
      fileReader.onloadend = (() => {
        setFileURL(fileReader.result);
        disabledPlayButton(false); // TODO: fix
        setVideoChanged(true);
      })
      fileReader.readAsDataURL(file);
    }
  }, [file]);

  const loadModel = async (path) => {
    model.current = new cvstfjs.ObjectDetectionModel();
    await model.current.loadModelAsync(path);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return ctx;
  }

  const showDetectItemsOnCanvas = (results) => {
    const ctx = clearCanvas();

    let countCurrentVehicles = 0;

    for (let i = 0; i < results[0].length; i++) {
      const [x1, y1, x2, y2] = results[0][i];
      const probability = results[1][i];
      // const tag            = results[2][i];

      if (probability >= internalThresholdValue.current) {
        const [rectX, rectY] = [x1 * width, y1 * height];
        const [rectWith, rectHeight] = [x2 * width - rectX, y2 * height - rectY]

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

  }



  const predict = async () => {
    const data = videoRef.current;
    const results = await model.current.executeAsync(data);
    showDetectItemsOnCanvas(results);
    const velocityRender = 10; // ms
    if (!finishPredicting.current) // finish recursivity
      setTimeout(predict, velocityRender);
  };

  const onLoadFile = (e) => {
    setFile(e.target.files[0]);
    finishPredicting.current = true; // control recursivity
    pauseVideo();
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

  const playVideo = () => {
    finishPredicting.current = false;
    // Control video speed for improve performance in low-end devices
    // videoRef.current.playbackRate = 0.5;
    predict();
    videoRef.current.play();
    setIsPlaying(true);
  }

  const pauseVideo = () => {
    finishPredicting.current = true;
    videoRef.current.pause();
    setIsPlaying(false);
  }

  const resetPredict = () => {
    finishPredicting.current = true;
    // reset video
    videoRef.current.currentTime = 0;
    pauseVideo();
    // set values
    clearCanvas();
    setTimeout(clearCanvas, 100); // fix: clear canvas update
  }


  return <>
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
          // onMouseMove={showValidAreaOnCanvas}
          // onMouseDown={onClickValidArea}
          ref={canvasValidZone}
          width={width}
          height={height}
        />
      </div>

      <div className="information">
        <Button
          variant="contained"
          component="label"
          startIcon={<FileUploadIcon />}
          style={{backgroundColor: '#9366cb'}}>
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
  </>
})

export default VideoInformation;