import React from 'react';
import EventEmitter from 'events';
import Controls from './components/Controls';
import Stage from './components/Stage';
import Generator from '../generator/Generator';
import PixelData from '../generator/PixelData';
import CanvasGridRenderer from '../renderers/CanvasGridRenderer';
const {setSeed} = require('../random');

const identity = x => x;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.events = new EventEmitter();
    this.events.on('state', this.handleStateChange);
    this.seed = 1337;
  }
  handleStateChange = state => {
    setSeed(this.seed);
    const pixelData = new PixelData(state.cols, state.rows, state.pixels);
    const transforms = [
      {name: 'randomize'},
      state.outline && {
        name: 'outline',
        options: {
          outlineCharacter: 2,
          whichCharacters: [1],
          transparentCharacters: [0],
        },
      },
      state.mirrorX && {name: 'mirrorx'},
      state.mirrorY && {name: 'mirrory'},
    ].filter(identity);
    const generator = new Generator({
      pixelData,
      transforms,
    });
    const padding = 10;
    const pixelSize = state.zoom;
    const {
      width: destWidth,
      height: destHeight,
    } = this.canvas.current.getBoundingClientRect();
    this.canvas.current.width = destWidth;
    this.canvas.current.height = destHeight;
    const ctx = this.canvas.current.getContext('2d');

    const srcWidth =
      state.cols * pixelSize * (state.mirrorX ? 2 : 1) + 2 * padding;
    const srcHeight =
      state.rows * pixelSize * (state.mirrorY ? 2 : 1) + 2 * padding;
    const cols = Math.ceil(destWidth / srcWidth);
    const rows = Math.ceil(destHeight / srcHeight);
    const renderer = new CanvasGridRenderer({
      rows,
      cols,
      padding,
      pixelSize,
    });
    renderer.render(generator);
    ctx.drawImage(
      renderer.canvas,
      0,
      0,
      renderer.canvas.width,
      renderer.canvas.height,
    );
  };
  render() {
    return (
      <div class="columns is-fullwidth">
        <div class="column is-narrow">
          <Controls events={this.events} rows={8} cols={6} />
        </div>
        <div class="column">
          <Stage events={this.events} ref={this.canvas} />
        </div>
      </div>
    );
  }
}

export default App;
