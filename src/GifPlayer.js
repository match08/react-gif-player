import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import './GifPlayer.scss';

const GifPlayer = ({ gif, still, playing, toggle, onLoad, ...rest }) => (
  <div
    className={classNames('gif_player', { 'playing': playing })}
    onClick={toggle}
  >
    <div className="play_button" />
    <img hidden={playing} className="still" {...rest} src={still} />
    <img hidden={playing} onLoad={onLoad} {...rest} src={gif} />
  </div>
);

GifPlayer.propTypes = {
  gif: PropTypes.string,
  still: PropTypes.string,
  playing: PropTypes.bool,
  toggle: PropTypes.func
};

export default GifPlayer;
