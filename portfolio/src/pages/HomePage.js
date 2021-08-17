import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Carousel from 'react-bootstrap/Carousel'
import Spectrum from '../components/Spectrum';
import Video from '../components/Video';
import Content from '../components/Content';
import Fbx from '../components/Fbx';
import Nav from 'react-bootstrap/Nav'
import { WaveSpinner } from "react-spinners-kit";

function HomePage(props) {

  const [index, setIndex] = React.useState(0);
  const [isLoading, setLoading] = React.useState(true);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <div style={{fluid: true,paddingTop: 50, justifyContent:"center", backgroundColor: 'rgba(52, 52, 52, 0)'}}>
      <Nav justify className="justify-content-center" style={{position: "absolute", zIndex: 10000, top: 100, left: "41%", width: "18%", backgroundColor: 'rgba(52, 52, 52, 0)'}} variant="tabs" defaultActiveKey="/home">
        <Nav.Item>
          <Nav.Link eventKey={0} active={index === 0} onSelect={() => {handleSelect(0)}}>Home</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={1} active={index === 1} onSelect={() => {handleSelect(1)}}>Trailers</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={2} active={index === 2} onSelect={() => {handleSelect(2)}}>Gameplay</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={3} active={index === 3} onSelect={() => {handleSelect(3)}}>
            Musics
          </Nav.Link>
        </Nav.Item>
      </Nav>
      {isLoading ? <div style={{position:"absolute", top: "50%", left: "50%",}}><WaveSpinner size={200}/></div> : null}
      {index === 0 ? <Content>
          Une seule vidéo
        </Content> : null}
      {index === 1 ? <Video fluid={true} /> : null}
      {index === 2 ? <Fbx setLoading={setLoading}/> : null}
      {index === 3 ? <Spectrum setLoading={setLoading}/> : null}
    </div>
  );
}

export default HomePage;
