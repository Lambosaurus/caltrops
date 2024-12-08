import './app.css';

import MainPage from './pages/MainPage';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";

const App = (props) => {
  return (
    <DndProvider backend={HTML5Backend}><MainPage></MainPage></DndProvider>
  );
};
export default App;