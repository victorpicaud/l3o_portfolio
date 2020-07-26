import React from 'react';

import Hero from '../components/Hero';
import Content from '../components/Content';
import ContactForm from '../components/ContactForm';

function ContactPage(props) {


  return (
    <div>
      <Hero title={props.title}/>
      <Content>
        <ContactForm/>
      </Content>
    </div>
  );
}

export default ContactPage;