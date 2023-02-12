import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';

import Home from '../views/home'

function App() {
  return (
    <div className="App" data-testid="App">
      <Home />
    </div>
  );
}

export default App;
