import React from 'react';
import Panel from './Panel';
import Input from './Input';
import Dropdown from './Dropdown';
import PixelGrid from './PixelGrid';
import Button from './Button';
import Field from './Field';
import Generator from '../../generator/Generator';
import {saveTemplate, deleteTemplate} from '../../generator/templates';

class Controls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      template: 'robot',
      rows: 5,
      cols: 5,
      pixels: Array(5 * 5).fill(0),
      seed: '1337',
      zoom: 10,
      padding: 0,
      mirrorX: false,
      mirrorY: false,
      backgroundColor: '#777777',
      foregroundColor: '#FFFFFF',
      detailsColor: '#333333',
      outline: false,
      outlineColor: '#000000',
      backgroundColorEnabled: true,
      showPixelGridHelp: false,
    };
  }

  componentDidMount() {
    this.setTemplate(this.state.template, true);
  }

  toggleState = name => {
    this.setState({[name]: !this.state[name]});
  };

  setTemplate = (template, updateStore) => {
    const {
      width: cols,
      height: rows,
      data: pixels,
      options,
    } = Generator.templates[template];
    const {
      mirrorX,
      mirrorY,
      padding = 10,
      zoom = 10,

      outline = this.state.outline,
      outlineColor = this.state.outlineColor,
      foregroundColor = this.state.foregroundColor,
      detailsColor = this.state.detailsColor,
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
        outline,
        outlineColor,
        foregroundColor,
        detailsColor,
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
          <Field disabled={!this.state.backgroundColorEnabled}>
            <Field.Label>
              <input
                name="backgroundColorEnabled"
                type="checkbox"
                checked={this.state.backgroundColorEnabled}
                onChange={this.handleChange}
              />
              Background:
            </Field.Label>
            <Field.Control>
              <Input
                name="backgroundColor"
                type="color"
                value={this.state.backgroundColor}
                disabled={!this.state.backgroundColorEnabled}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Zoom:</Field.Label>
            <Field.Control>
              <Input
                name="zoom"
                type="number"
                step="1"
                min="1"
                max="20"
                value={this.state.zoom}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Padding:</Field.Label>
            <Field.Control>
              <Input
                name="padding"
                type="number"
                step="1"
                min="0"
                max="50"
                value={this.state.padding}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Random Seed:</Field.Label>
            <Field.Control>
              <Input
                name="seed"
                type="text"
                value={this.state.seed}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
        </Panel>
        <Panel title="Template">
          <Field disabled={!this.state.outline}>
            <Field.Label>
              <input
                name="outline"
                type="checkbox"
                checked={this.state.outline}
                onChange={this.handleChange}
              />
              Outline:
            </Field.Label>
            <Field.Control>
              <Input
                name="outlineColor"
                type="color"
                value={this.state.outlineColor}
                disabled={!this.state.outline}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Foreground:</Field.Label>
            <Field.Control>
              <Input
                name="foregroundColor"
                type="color"
                value={this.state.foregroundColor}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Accent:</Field.Label>
            <Field.Control>
              <Input
                name="detailsColor"
                type="color"
                value={this.state.detailsColor}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Width:</Field.Label>
            <Field.Control>
              <Input
                name="cols"
                type="number"
                step="1"
                min="1"
                max="30"
                value={this.state.cols}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Height:</Field.Label>
            <Field.Control>
              <Input
                name="rows"
                type="number"
                step="1"
                min="1"
                max="50"
                value={this.state.rows}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>MirrorX:</Field.Label>
            <Field.Control>
              <Input
                name="mirrorX"
                type="checkbox"
                checked={this.state.mirrorX}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>MirrorY:</Field.Label>
            <Field.Control>
              <Input
                name="mirrorY"
                type="checkbox"
                checked={this.state.mirrorY}
                onChange={this.handleChange}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Template:</Field.Label>
            <Field.Control>
              <Dropdown
                onChange={this.handleChange}
                name="template"
                value={this.state.template}
                items={Object.keys(Generator.templates).map(key => ({
                  name: key,
                  value: key,
                }))}
              />
              <Button onClick={this.deleteTemplate}>Delete</Button>
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>
              <span
                className="icon has-text-info"
                onClick={() => this.toggleState('showPixelGridHelp')}>
                <i className="fas fa-question-circle" />
              </span>
            </Field.Label>
            <Field.Control>
              <PixelGrid
                rows={this.state.rows}
                cols={this.state.cols}
                pixels={this.state.pixels}
                mirrorX={this.state.mirrorX}
                mirrorY={this.state.mirrorY}
                onChange={this.updateState}
              />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label />
            <Field.Control>
              <Button onClick={this.resetPixelGrid}>Reset</Button>
              <Button onClick={this.saveTemplate}>Save</Button>
            </Field.Control>
          </Field>
        </Panel>
        <div
          className={[
            'modal',
            this.state.showPixelGridHelp ? 'is-active' : '',
          ].join(' ')}>
          <div
            className="modal-background"
            onClick={() => this.toggleState('showPixelGridHelp')}
          />
          <div className="modal-content">
            <article className="message is-primary">
              <div className="message-header">
                <p>Editing The Template</p>
                <button
                  className="delete"
                  aria-label="delete"
                  onClick={() => this.toggleState('showPixelGridHelp')}
                />
              </div>
              <div className="message-body">
                <p className="content">
                  Use your mouse to edit the generator template.
                </p>
                <p className="content">
                  Left-clicking the squares will cycle them through 3 different
                  states:
                  <ul>
                    <li>transparent pixel</li>
                    <li>
                      foreground pixel (has a 50% of becoming a transparent
                      pixel)
                    </li>
                    <li>
                      accent pixel (has a 50% chance of turning into foreground
                      pixel)
                    </li>
                  </ul>
                </p>
                <p className="content">
                  Right-clicking a pixel will disable its randomness and will
                  make it always be the state that you specified.
                </p>
                <p className="content">
                  Middle-clicking on the pixel grid and dragging will allow you
                  to move the whole pattern. This is pretty handy when you
                  resize the template and want to re-position it.
                </p>
              </div>
            </article>
          </div>
        </div>
      </React.Fragment>
    );
  }
  resetPixelGrid = () => {
    const {cols, rows} = this.state;
    const pixels = Array(cols * rows).fill(0);
    const template = 'none';
    this.updateState({pixels, template});
  };
  deleteTemplate = () => {
    if (
      confirm(
        `Are you sure that you want to delete template ${this.state.template}?`,
      )
    ) {
      deleteTemplate(this.state.template);
      this.updateState({template: 'none'});
    }
  };
  saveTemplate = () => {
    const templateName = prompt(
      'Please enter the name for the current template',
      this.state.template,
    );
    if (templateName) {
      const {
        cols,
        rows,
        pixels,
        mirrorX,
        mirrorY,
        outline,
        outlineColor,
        foregroundColor,
        detailsColor,
      } = this.state;
      saveTemplate(templateName, {
        width: cols,
        height: rows,
        data: pixels,
        options: {
          mirrorX,
          mirrorY,
          outline,
          outlineColor,
          foregroundColor,
          detailsColor,
        },
      });
      this.updateState({template: templateName});
    }
  };
}

export default Controls;
