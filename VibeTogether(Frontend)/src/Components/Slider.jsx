import React from 'react';
import './Style/Slider.css';

const Slider = (props) => {
  return (
    <input
      className="slider"
      id="Slider"
      type="range"
      min="0"
      max="100"
      // Using CSS custom property '--progress' to style the slider dynamically
      style={{ '--progress': `${props.values.slideValue}%` }}
      value={props.values.slideValue}

      // When the user starts dragging the slider, set seeking to true
      onMouseDown={() => props.values.setIsSeeking(true)}

      // When the user releases the slider, publish the new value and end seeking
      onMouseUp={(e) => {
        props.values.Publish(null, { type: "slider", value: e.target.value });
        props.values.setIsSeeking(false);
      }}

      // While dragging the slider, update the slideValue state in real time
      onChange={(e) => {
        props.values.setSlideValue(e.target.value);
      }}
    />
  );
};

export default Slider;
