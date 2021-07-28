import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image'

function Hero(props) {
  return(
    <Jumbotron className="bg-transparent jumbotron-fluid p-0">
      <Container fluid={true}>
        <Row className="justify-content-center py-5">
          { props.title && <h1 className="display-1 font-weight-bolder">{ props.title }</h1>}
        </Row>
        <Row className="justify-content-center py-5">
          { props.image && <Image src={props.image} rounded fluid/>}
        </Row>
        <Row className="justify-content-center py-5">
          <Col md={6} sm={3} style={{alignItems: "center", justifyContent: "center"}}>
            { props.subTitle && <h3 className="display-4 font-weight-light">{ props.subTitle }</h3>}
            { props.text && <h2 className="lead font-weight-light">{ props.text }</h2>}
          </Col>
        </Row>
      </Container>
    </Jumbotron>
  );
}

export default Hero;
