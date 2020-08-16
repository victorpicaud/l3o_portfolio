import React, { useState } from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import Hero from '../components/Hero';
import Content from '../components/Content';
import Spectrum from '../components/Spectrum';
import Video from '../components/Video';


function HomePage(props) {
  return (
    <Carousel showThumbs={false} >
      <div className="no-border" >
        <Spectrum />
      </div>
      <div className="no-border">
        <Video fluid={true} />
      </div>
    </Carousel>
  );
}

export default HomePage;
