import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

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

  handleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
        [name]: value
      });
  }

  handleSubmit = (event) => {
    event.preventDefault();

    this.setState({
      disabled: true
    });
  }

  render() {
    return(
      <Form onSubmit={this.handleSubmit}>
        <Form.Group>
          <Form.Label htmlFor="full-name">Nom :</Form.Label>
          <Form.Control id="full-name" name="name" type="text" value={this.state.name} onChange={this.handleChange}/>
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor="email">Email :</Form.Label>
          <Form.Control id="email" name="email" type="email" value={this.state.email} onChange={this.handleChange}/>
        </Form.Group>

        <Form.Group>
          <Form.Label htmlFor="message">Message :</Form.Label>
          <Form.Control id="message" name="message" as="textarea" rows="3" value={this.state.message} onChange={this.handleChange}/>
        </Form.Group>

        <Button className="d-inline-block" variant="primary" type="submit" disabled={this.state.disabled}>
          Envoyer
        </Button>

        {this.state.emailSent === true && <p className="d-inline success-msg">Message Envoyé!</p>}
        {this.state.emailSent === false && <p className="d-inline err-msg">Le Message n'est pas envoyé!</p>}
      </Form>
    );
  }

}

export default ContactForm;