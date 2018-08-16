import React from 'react';
import Panel from './Panel';
import LabelInput from './LabelInput';
import PixelGrid from './PixelGrid';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    const cols = props.cols;
    const rows = props.rows;
    this.state = {
      rows,
      cols,
      zoom: 10,
      pixels: Array(cols * rows).fill(0),
      outline: true,
      mirrorX: true,
      mirrorY: false,
    };
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.handleMouseUp);
  }
  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleChange = event => {
    const name = event.target.name;
    const value = parseInt(event.target.value);
    if (name == 'cols' || name == 'rows') {
      const {rows, cols, pixels} = this.state;
      const newRows = name === 'rows' ? value : rows;
      const newCols = name === 'cols' ? value : cols;
      const newPixels = Array(newCols * newRows).fill(0);
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++)
          if (x < newCols && y < newRows)
            newPixels[y * newCols + x] = pixels[y * cols + x] || 0;

      this.setState(
        {rows: newRows, cols: newCols, pixels: newPixels},
        this.handleStateChange,
      );
      return;
    }
    if (event.target.type == 'number') {
      this.setState({[name]: value}, this.handleStateChange);
    } else if (event.target.type == 'checkbox') {
      this.setState({[name]: event.target.checked}, this.handleStateChange);
    }
  };

  handleStateChange = () => {
    this.props.events && this.props.events.emit('state', this.state);
  };

  render() {
    return (
      <Panel>
        <LabelInput
          label="Zoom:"
          name="zoom"
          type="number"
          step="1"
          min="1"
          max="20"
          value={this.state.zoom}
          onChange={this.handleChange}
        />
        <LabelInput
          label="Rows:"
          name="rows"
          type="number"
          step="1"
          min="1"
          max="20"
          value={this.state.rows}
          onChange={this.handleChange}
        />
        <LabelInput
          label="Cols:"
          name="cols"
          type="number"
          step="1"
          min="1"
          max="20"
          value={this.state.cols}
          onChange={this.handleChange}
        />
        <LabelInput
          label="Outline:"
          name="outline"
          type="checkbox"
          checked={this.state.outline}
          onChange={this.handleChange}
        />
        <LabelInput
          label="MirrorX:"
          name="mirrorX"
          type="checkbox"
          checked={this.state.mirrorX}
          onChange={this.handleChange}
        />
        <LabelInput
          label="MirrorY:"
          name="mirrorY"
          type="checkbox"
          checked={this.state.mirrorY}
          onChange={this.handleChange}
        />
        <PixelGrid
          rows={this.state.rows}
          cols={this.state.cols}
          pixels={this.state.pixels}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
          onMouseLeave={this.handleMouseLeave}
        />
      </Panel>
    );
  }

  handleMouseDown = e => {
    this.mouseDown = {
      button: e.button,
      x: e.clientX,
      y: e.clientY,
    };
    this.dragging = true;
    if (e.button == 1) {
      this.dragPixels = [...this.state.pixels];
    }
  };
  handleMouseMove = e => {
    if (this.dragging) {
      if (this.mouseDown.button == 1) {
        // drag
        const k = 8;
        const dx = Math.floor((e.clientX - this.mouseDown.x) / k);
        const dy = Math.floor((e.clientY - this.mouseDown.y) / k);
        const newPixels = [...this.dragPixels];
        const {rows, cols} = this.state;
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < cols; x++)
            newPixels[
              ((y + rows + dy) % rows) * cols + (x + cols + dx) % cols
            ] = this.dragPixels[y * cols + x];

        this.setState({pixels: newPixels}, this.handleStateChange);
      } else {
        //draw
        const {rows, cols, pixels} = this.state;
        const rect = e.target.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / 10);
        const y = Math.floor((e.clientY - rect.top) / 10);
        const index = y * cols + x;
        if (this.mouseDown.value === undefined) {
          this.mouseDown.value = pixels[index];
        }
        pixels[index] = this.mouseDown.value;
        this.setState({pixels}, this.handleStateChange);
      }
    }
  };
  handleMouseLeave = e => {
    if (this.mouseDown.button == 0) {
      this.dragging = false;
    }
  };
  handleMouseUp = e => {
    const {rows, cols, pixels} = this.state;
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 10);
    const y = Math.floor((e.clientY - rect.top) / 10);
    const index = y * cols + x;
    if (this.mouseDown && this.mouseDown.button == 2) {
      this.incrementPixel(index, 1);
    } else if (this.mouseDown && this.mouseDown.button == 0) {
      const mouseDownX = Math.floor((this.mouseDown.x - rect.left) / 10);
      const mouseDownY = Math.floor((this.mouseDown.y - rect.top) / 10);
      const mouseDownIndex = mouseDownY * cols + mouseDownX;
      if (index == mouseDownIndex) {
        this.incrementPixel(index, -1);
      }
    }
    this.dragging = false;
    this.dragPixels = false;
  };
  incrementPixel(index, value) {
    const pixels = [...this.state.pixels];
    pixels[index] = (pixels[index] + value + 3) % 3;
    this.setState({pixels}, this.handleStateChange);
  }
}

export default Controls;
