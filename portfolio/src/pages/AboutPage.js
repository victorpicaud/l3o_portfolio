import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';
import Spectrum from '../components/Spectrum';

function AboutPage(props) {


  return (
    <div>
      <Hero title={props.title} subTitle={props.subTitle}/>

      <Spectrum />
     </div>
  );
}

export default AboutPage;