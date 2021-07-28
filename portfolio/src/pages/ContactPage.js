import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';
import ContactForm from '../components/ContactForm';

function ContactPage(props) {


  return (
    <div>
      <Hero title={props.title} text={props.text}/>
      <Content>
        <ContactForm/>
      </Content>
      <Hero subTitle={props.contacttitle} text={`Léo Lemberger
        12 Rue des fossés St Marcel Paris, Île de France 75005 France lemberger.leo.istds@gmail.com
        (+33)777004419`} />
    </div>
  );
}

export default ContactPage;
