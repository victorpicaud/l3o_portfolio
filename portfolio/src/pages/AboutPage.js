import React from 'react';

import Hero from '../components/Hero';
import Video from '../components/Video';

function AboutPage(props) {


  return (
    <div>
      <Hero title={props.title} subTitle={props.subTitle}/>
      <Video />
     </div>
  );
}

export default AboutPage;
