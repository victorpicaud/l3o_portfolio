import React from 'react';
import Form from 'react-bootstrap/Form';

class ContactForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      email: '',
      message: '',
      disabled: false,
      emailSent: null,
    }
  }

  render() {
    return(
      <Form>
        <Form.Group>
          <Form.Label htmlFor="full-name">Nom :</Form.Label>
          <Form.Control id="full-name" name="name" type="text" value={this.state.name} onChange={this.handleChange}/>
      </Form.Group>
      </Form>
    );
  }

}

export default ContactForm;