import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";

import { MainView } from "../views/main-view";

function App() {
  return (
    <div className="App" data-testid="App">
      <MainView />
    </div>
  );
}

export default App;
