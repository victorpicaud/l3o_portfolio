import React from 'react';

import ris1 from '../assets/images/ris1.jpg'
import ris2 from '../assets/images/ris2.jpg'
import ris3 from '../assets/images/ris3.png'

class Carousel extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      items: [
        {
            id: 0,
            title: 'Card1',
            subTitle: 'Cardst 1',
            imgSrc: ris1,
            link: 'https://google.com',
            selected: false
        },
        {
            id: 1,
            title: 'Card 2',
            subTitle: 'Cardst 2',
            imgSrc: ris2,
            link: 'https://www.youtube.com',
            selected: false
        },
        {
            id: 2,
            title: 'Card 3',
            subTitle: 'Cardst 3',
            imgSrc: ris3,
            link: 'https://github.com',
            selected: false
        },
    ]
    }
  }

  handleCardClick = (id, card) => {
    let items = [...this.state.items];

    items[id].selected = items[id].selected ? false : true;

    items.forEach( item => {
      if(item.id != id) {
        item.selected = false;
      }
    });

    this.setState({
      items
    });
  }

  makeItems = (items) => {
    return items.map(item => {
      return <Card item={item} onClick={(e => this.handleCardClick(item.id, e))} key={item.id} />
    });
  }



  render() {
    return(
      <p>Carousel Works!!</p>
    );
  }
}

export default Carousel;