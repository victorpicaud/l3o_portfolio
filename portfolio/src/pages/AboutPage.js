import React from 'react';

import Hero from '../components/Hero';

function AboutPage(props) {


  return (
    <div>
      <Hero title={props.title} subTitle={props.subTitle} text={props.text} image={props.image}/>
     </div>
  );
}

export default AboutPage;
