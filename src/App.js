import { useEffect, useState, useRef } from 'react';
import * as cvstfjs from '@microsoft/customvision-tfjs';
import './App.css';
import image from "./assets/images/image3.png";


function App() {
  const imageRef              = useRef(null);
  const model                 = useRef(null);
  const [width, setWidth]     = useState(0);
  const [height, setHeight]   = useState(0);

  useEffect(() => {
    loadModel("model.json");
  }, []);

  const loadModel = async (path) => {
    model.current = new cvstfjs.ObjectDetectionModel();
    await model.current.loadModelAsync(path);
  };

  const onloadImage = () => {
    setWidth(imageRef.current.width)
    setHeight(imageRef.current.height)
  }

  const showDetectItemsOnCanvas = (results) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    for (let i = 0; i < results[0].length; i++) {
      const [x1, y1, x2, y2]  = results[0][i];
      const probability       = results[1][i];
      const tag               = results[2][i];

      if (probability > 0.15) {
        const [rectX, rectY]          = [x1 * width, y1 * height];
        const [rectWith, rectHeight]  = [x2 * width - rectX, y2 * height - rectY]
      
        ctx.strokeStyle = 'red'
        ctx.strokeRect(rectX, rectY, rectWith, rectHeight);

      }
    }
  }

  const predict = async () => {
    const data = document.getElementById('image');
    const results = await model.current.executeAsync(data);
    console.log(results)
    showDetectItemsOnCanvas(results);
    
  };  

  return (
    <div id="App"> 
      <div className='container'>
        <img id='image' src={image} ref={imageRef} onLoad={onloadImage} />
        <canvas id="canvas" width={width} height={height}/>
      </div>

      <button onClick={predict}>
        Execute
      </button>


      
    </div>
  );
}

export default App;
