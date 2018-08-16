import React from 'react';
import Panel from './Panel';
import LabelInput from './LabelInput';
import Dropdown from './Dropdown';
import PixelGrid from './PixelGrid';
import Button from './Button';
import Generator from '../../generator/Generator';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      template: 'none',
      rows: 5,
      cols: 5,
      pixels: Array(5 * 5).fill(0),
      seed: '1337',
      zoom: 1,
      padding: 0,
      outline: false,
      mirrorX: false,
      mirrorY: false,
      backgroundColor: '#777777',
      backgroundColorEnabled: true,
    };
    this.setTemplate(props.template);
  }
  setTemplate = (template, updateStore) => {
    const {pixelData, options} = Generator.templates[template];
    const cols = pixelData.width;
    const rows = pixelData.height;
    const pixels = [...pixelData.data];
    const {
      mirrorX = false,
      mirrorY = false,
      outline = false,
      padding = 10,
      zoom = 10,
    } = options;
    this.setState(
      {
        template,
        rows,
        cols,
        pixels,
        seed: '1337',
        zoom,
        padding,
        outline,
        mirrorX,
        mirrorY,
        backgroundColor: '#777777',
        backgroundColorEnabled: true,
      },
      updateStore && this.handleStateChange,
    );
  };

  handleChange = event => {
    const name = event.target.name;
    const type = event.target.type;
    const value = event.target.value;
    if (name == 'cols' || name == 'rows') {
      const {rows, cols, pixels} = this.state;
      const newRows = name === 'rows' ? parseInt(value) : rows;
      const newCols = name === 'cols' ? parseInt(value) : cols;
      const newPixels = Array(newCols * newRows).fill(0);
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++)
          if (x < newCols && y < newRows)
            newPixels[y * newCols + x] = pixels[y * cols + x] || 0;

      this.updateState({rows: newRows, cols: newCols, pixels: newPixels});
      return;
    }
    if (name == 'template') {
      this.setTemplate(value, true);
      return;
    }
    if (type == 'number') {
      this.updateState({[name]: parseInt(value)});
    } else if (type == 'color' || type == 'text' || type == 'hidden') {
      this.updateState({[name]: value});
    } else if (type == 'checkbox') {
      this.updateState({[name]: event.target.checked});
    }
  };

  updateState = state => {
    this.setState(state, this.handleStateChange);
  };
  handleStateChange = () => {
    this.props.events && this.props.events.emit('state', this.state);
  };

  render() {
    return (
      <React.Fragment>
        <Panel title="Options">
          <LabelInput
            label={[
              <input
                name="backgroundColorEnabled"
                type="checkbox"
                checked={this.state.backgroundColorEnabled}
                onChange={this.handleChange}
              />,
              ' Background:',
            ]}
            name="backgroundColor"
            type="color"
            value={this.state.backgroundColor}
            disabled={!this.state.backgroundColorEnabled}
            onChange={this.handleChange}
          />
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
            label="Outline:"
            name="outline"
            type="checkbox"
            checked={this.state.outline}
            onChange={this.handleChange}
          />
          <LabelInput
            label="Padding:"
            name="padding"
            type="number"
            step="1"
            min="0"
            max="50"
            value={this.state.padding}
            onChange={this.handleChange}
          />
          <LabelInput
            label="Random Seed:"
            name="seed"
            type="text"
            value={this.state.seed}
            onChange={this.handleChange}
          />
        </Panel>
        <Panel title="Template">
          <LabelInput
            label="Width:"
            name="cols"
            type="number"
            step="1"
            min="1"
            max="20"
            value={this.state.cols}
            onChange={this.handleChange}
          />
          <LabelInput
            label="Height:"
            name="rows"
            type="number"
            step="1"
            min="1"
            max="20"
            value={this.state.rows}
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
          <Dropdown
            onChange={this.handleChange}
            label="Template:"
            name="template"
            value={this.state.template}
            items={Object.keys(Generator.templates).map(key => ({
              name: key,
              value: key,
            }))}
          />
          <PixelGrid
            rows={this.state.rows}
            cols={this.state.cols}
            pixels={this.state.pixels}
            onChange={this.updateState}
          />
          <Button onClick={this.resetPixelGrid}>Reset</Button>
        </Panel>
      </React.Fragment>
    );
  }
  resetPixelGrid = () => {
    const {cols, rows} = this.state;
    const pixels = Array(cols * rows).fill(0);
    const template = 'none';
    this.updateState({pixels, template});
  };
}

export default Controls;
