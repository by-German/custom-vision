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
  ListItemText
} from '@mui/material';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';

const drawerWidth = 300;

function App() {
  const model = useRef(null);
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const [file, setFile] = useState();
  const [fileURL, setFileURL] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

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

  const onloadImage = () => {
    setWidth(imageRef.current.width)
    setHeight(imageRef.current.height)
  }

  const showDetectItemsOnCanvas = (results) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < results[0].length; i++) {
      const [x1, y1, x2, y2] = results[0][i];
      const probability = results[1][i];
      // const tag               = results[2][i];

      if (probability > 0.15) {
        const [rectX, rectY] = [x1 * width, y1 * height];
        const [rectWith, rectHeight] = [x2 * width - rectX, y2 * height - rectY]

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

  const onLoadFile = (e) => {
    setFile(e.target.files[0]);
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <h3>Vehicule Detection</h3>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: { drawerWidth },
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >

        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {['Inbox', 'Starred'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {['All mail'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* start content */}
        <div id="App">

          <div className='img-container'>
            <img id='image'
              src={fileURL}
              ref={imageRef}
              onLoad={onloadImage}
            />
            <canvas id="canvas"
              width={width}
              height={height}
            />
          </div>

          <Button variant="contained" onClick={predict}>
            Execute
          </Button>

          <input
            type="file"
            ref={inputRef}
            onChange={onLoadFile}
            
          />


        </div>
        {/* end content */}
      </Box>
    </Box>
  );
}

export default App;
