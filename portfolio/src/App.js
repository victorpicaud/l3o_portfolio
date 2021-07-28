import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button'
import NavDropdown from 'react-bootstrap/NavDropdown'
import './App.css';

import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import leoimg from './assets/images/leo.jpg';

const state = {
  ltitle: "Language",
  title: "Leo Lemberger",
  headerLinks: [
    { title: "Home", path: '/' },
    { title: "About", path: '/about' },
    { title: "Contact", path: '/contact' },
  ],
  home: {
    title: "Leo Lemberger",
    subTitle: "",
    text: ""
  },
  about: {
    title: "About me",
    subTitle: "",
    text: "\n\n\n\n\nLeo Lemberger is a French Junior Sound Designer who owns a Bachelor in Audio Engineering and a Bachelor in Sound-Design for Video Games. His passion for Sound and Music has been driving him since childhood. He is now focusing his work on Video Games and Interactive Media.",
  },
  contact: {
    title: "Contact",
    subTitle: "Sous titre 3",
    text: "Don’t hesitate to reach out with the contact information below, or send a message using the form."
  }
}

const statefrench = {
  ltitle: "Langue",
  title: "Leo Lemberger",
  headerLinks: [
    { title: "Accueil", path: '/' },
    { title: "À propos", path: '/about' },
    { title: "Contact", path: '/contact' },
  ],
  home: {
    title: "Leo Lemberger",
    subTitle: "Sound Designer Junior",
    text: ""
  },
  about: {
    title: "À propos",
    subTitle: "",
    text: "\n\n\n\n\nLéo Lemberger est un Junior Sound Designer Français titulaire d'une License de Technicien Son et d'une License de Sound-Designer pour Jeux Videos. Passionné par le son et la musique depuis son enfance, son travail s'oriente aujourd'hui vers le Sound-Design pour les Jeux vidéos et les médias interactifs.",
  },
  contact: {
    title: "Contact",
    subTitle: "Sous titre 3",
    text: "N'hésitez pas à me contacter avec les informations ci-dessous ou via le formulaire."
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = state;
  }
  render() {
    return (
      <Router>
        <Container className="p-0" style={{backgroundColor:"black"}} fluid={true}>

          <Navbar className="border-bottom" bg="black" expand="lg">
            <Navbar.Brand style={{color:"white"}} >Leo Lemberger</Navbar.Brand>
            <Navbar.Toggle className="border-0" aria-controls="navbar-toggle" />
            <Navbar.Collapse style={{color:"white"}} id="navbar-toggle" >
              <Nav className="ml-auto">
                <Link className="nav-link" style={{color:"white"}} to="/">{this.state.headerLinks[0].title}</Link>
                <Link className="nav-link" to="/about" style={{color:"white"}} >{this.state.headerLinks[1].title}</Link>
                <Link className="nav-link" style={{color:"white"}} to="/contact">{this.state.headerLinks[2].title}</Link>
                <NavDropdown title={this.state.ltitle} titleStyle={{color:"white"}} id="basic-nav-dropdown">
                  <NavDropdown.Item eventKey="1" as={Button} active={this.state === state} onSelect={() => {this.setState(state)}} >English</NavDropdown.Item>
                  <NavDropdown.Item eventKey="2" as={Button} active={this.state === statefrench} onSelect={() => {this.setState(statefrench)}} >Francais</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <Route path="/" exact render={ () => <HomePage title={this.state.home.title} subTitle={this.state.home.subTitle} text={this.state.home.text} />}></Route>
          <Route path="/about" render={ () => <AboutPage image={leoimg} title={this.state.about.title} subTitle={this.state.about.subTitle} text={this.state.about.text} />}></Route>
          <Route path="/contact" render={ () => <ContactPage title={this.state.contact.title} subTitle={this.state.contact.subTitle} text={this.state.contact.text} />}></Route>
        </Container>
      </Router>
    );
  }
}

export default App;
