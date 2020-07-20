import React from 'react';
import logo from './logo.svg';
// Import the BrowserRouter, Route and Link components
import { BrowserRouter, Route, Link } from 'react-router-dom';
import Projects from './Projects.js';
import Cv from './Cv.js';
import Contact from './Contact.js';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">

        <Route exact path="/" component={Projects} />
        <Route path="/cv" component={Cv} />
        <Route path="/contact" component={Contact} />

        <div className="navigation">
          <div className="navigation-sub">
            <Link to="/" className="item">Projects</Link>
            <Link to="/cv" className="item">Cv</Link>
            <Link to="/contact" className="item">Contact</Link>

          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
