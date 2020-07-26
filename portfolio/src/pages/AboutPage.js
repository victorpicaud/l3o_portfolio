import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';

function AboutPage(props) {


  return (
    <div>
      <Hero title={props.title} subTitle={props.subTitle}/>

      <Content>
        About Leo Lemberger here
        Tell us about ya!!!!!
      </Content>
     </div>
  );
}

export default AboutPage;