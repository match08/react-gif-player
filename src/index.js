import React from 'react';
import PropTypes from 'prop-types';
import lifecyclesPoylfill from 'react-lifecycles-compat';

import GifPlayer from './GifPlayer';
import SuperGif from 'libgif';

const preload = (src, callback) => {
  var img = new Image();
  if (typeof callback === 'function') {
    img.onload = () => callback(img);
    img.setAttribute('crossOrigin', 'anonymous');
  }
  img.src = src;
};

const firstGifFrameUrl = img => {
  const canvas = document.createElement('canvas');
  if (typeof canvas.getContext !== 'function') {
    return null;
  }
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL();
}

class GifPlayerContainer extends React.Component {
  static getDerivedStateFromProps (nextProps, prevState) {
    const prevGif = prevState.providedGif;
    const nextGif = nextProps.gif;
    const prevStill = prevState.providedStill;
    const nextStill = nextProps.still;

    if (prevGif === nextGif && prevStill === nextStill) {
      return null;
    }
 
    return {
      playing: nextGif && nextProps.autoplay && prevGif !== nextGif
        ? true
        : prevState.playing,
      providedGif: nextGif,
      providedStill: nextStill,
      actualGif: nextGif,
      actualStill: nextStill || prevGif !== nextGif
        ? nextStill
        : prevState.actualStill,
      isToggle: nextProps.istoggle === undefined? false: nextProps.istoggle,
      onPlayEnd: nextProps.onPlayEnd,
      loop: nextProps.loop || 0
    };
  }

  constructor (props) {
    super(props);
    this.state = {
      playing: Boolean(props.autoplay),
      providedGif: props.gif,
      providedStill: props.still,
      actualGif: props.gif,
      actualStill: props.still,
      isToggle: Boolean(props.istoggle),
      onPlayEnd: props.onPlayEnd,
      loop: props.loop || 0
    };
    this.updateId = -1;
    this.loopCount = 0;
    this.onPlayEnd = this.onPlayEnd.bind(this);
  }

  componentDidMount () {
    if (typeof this.props.pauseRef === 'function') {
      this.props.pauseRef(() => this.setState({ playing: false }));
    }
    this.updateImages();
  }

  componentDidUpdate (prevProps, prevState) {
    this.updateImages(prevState);
    const { onTogglePlay } = this.props;
    if (prevState.playing !== this.state.playing && typeof onTogglePlay === 'function') {
      onTogglePlay(this.state.playing);
    }
    if(prevState.playing !== this.state.playing)
    {
      if(this.state.playing)
      {
        if(this.superGif)
        {
          this.superGif.play();
        }
      }
      else
      {
        if(this.superGif)
        {
          this.superGif.pause();
        }
      }
    }
  }
  componentWillUnmount()
  {
    if(this.superGif)
    {
      this.superGif.pause();
      this.superGif = null;
    }
  }
  updateImages (prevState = {}) {
    const { providedGif, providedStill } = this.state;
    if (
      providedGif &&
      !providedStill &&
      providedGif !== prevState.providedGif
    ) {
      const updateId = ++this.updateId;
      preload(providedGif, img => {
        if (this.updateId === updateId) {
          const actualStill = firstGifFrameUrl(img);
          if (actualStill) {
            this.setState({ actualStill });
          }
        }
      });
    }
  }

  toggle () {
    this.setState({
      playing: !this.state.playing
    });
  }
  onPlayEnd(data)
  {
    this.loopCount++;
    if(this.props.onPlayEnd)
    {
       this.props.onPlayEnd({type:'playEnd', ms:this.superGif.get_duration_ms(), duration: this.superGif.get_duration(), frame: this.superGif.get_current_frame() });
    }
    if(this.state.loop>0 && this.loopCount>= this.state.loop)
    {
      this.toggle();
    }
  }
  onLoad(event)
  {
    var img = event.target;
    if(this.superGif){
        if(this.state.playing)
        {
          this.loopCount = 0;
          this.superGif.play();
        }
        else
        {
          this.superGif.pause();
        }
        return;
    }
    if (/.*\.gif/.test(img.src)) 
    {
       this.superGif = new SuperGif({auto_play:this.state.playing,gif:img,show_progress_bar:false, on_end: this.onPlayEnd});
       this.superGif.load(event=>{
          if(this.state.playing)
          {
            this.onPlayEnd(event);
          }
       });
    }
  }
  render () {
    // extract these props but pass down the rest
    const { autoplay, pauseRef, onTogglePlay, onPlayEnd, loop, istoggle, ...rest } = this.props;
    const { actualGif, actualStill, playing, isToggle } = this.state;
    return (
      <GifPlayer
        {...rest}
        gif={actualGif}
        still={actualStill}
        playing={playing}
        toggle={() => {
          if(isToggle)
          {
            this.toggle();
          }
        }}
        onLoad={this.onLoad.bind(this)}
      />
    );
  }
}

lifecyclesPoylfill(GifPlayerContainer);

GifPlayerContainer.propTypes = {
  gif: PropTypes.string,
  still: PropTypes.string,
  autoplay: PropTypes.bool,
  pauseRef: PropTypes.func,
  onTogglePlay: PropTypes.func,
  istoggle: PropTypes.bool,
  onPlayEnd: PropTypes.func,
  loop: PropTypes.number
};

export default GifPlayerContainer;
