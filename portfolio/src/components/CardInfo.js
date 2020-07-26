import React from 'react';
import { useSpring, animated } from 'react-spring';

function CardInfo(props) {

  const style = useSpring({ opacity: 1, from: { opacity: 0} });

  return(
    <animated.div className="custom_card_info" style={style}>
      <p className="custom_card_title">{props.title}</p>
      <p className="custom_card_subtitle">{props.subTitle}</p>
      <a href={props.link} target="_blank" rel="noopener norefferrer">View</a>
    </animated.div>
  );

}

export default CardInfo;