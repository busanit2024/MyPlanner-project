import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './ui/Layout';
import MainPage from './components/main/MainPage';
import GlobalStyles from './styles/GlobalStyles.styles';

function App() {
return (
    <Router>
      <GlobalStyles />
      <Routes>
        <Route element={<Layout />} >
          <Route index element={<MainPage />} />
          <Route path="calendar" element={<MainPage />} />
        </Route>
      </Routes>
    </Router>

  );
}

export default App;
