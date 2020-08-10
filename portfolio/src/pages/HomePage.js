import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';

import Hero from '../components/Hero';
import Content from '../components/Content';
import Spectrum from '../components/Spectrum';


function HomePage(props) {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <div>
      <Hero title={props.title} subTitle={props.subTitle} />
      <Carousel activeIndex={index} onSelect={handleSelect} pause={true}>
        <Carousel.Item>
          <Spectrum/>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default HomePage;