import React from 'react';

import CardInfo from './CardInfo';

function Card(props) {
 return(
   <div className="d-inline-block custom_card" onClick={(e) => props.click(props.item )}>
     <img className="custom_card_img" src={props.item.imgSrc} alt={props.item.imgSrc} />
     { props.item.selected && <CardInfo title={props.item.title} subTitle={props.item.subTitle} link={props.item.link} /> }
   </div>
 );
}

export default Card;