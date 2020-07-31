import React from 'react';


import Hero from '../components/Hero';
import Content from '../components/Content';
import Spectrum from '../components/Spectrum';


function HomePage(props) {

  return (
    <div>
      <Hero title={props.title} subTitle={props.subTitle} text={props.text} />
      <Content>
        <Spectrum />
      </Content>


    </div>
  );
}

export default HomePage;