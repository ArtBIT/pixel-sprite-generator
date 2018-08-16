import React from 'react';
import withBulma from '../decorators/withBulma';

const MOUSE_BUTTON_LEFT = 0;
const MOUSE_BUTTON_MIDDLE = 1;
const MOUSE_BUTTON_RIGHT = 2;
const MAX_VALUE = 3;
const CELL_SIZE = 10;

class PixelGrid extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
  }

  componentDidMount() {
    this.ref.current.addEventListener(
      'contextmenu',
      e => e.preventDefault() || false,
    );
    document.addEventListener('mouseup', this.handleMouseDone);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseDone);
  }

  render() {
    const {cols, rows, pixels, ...restProps} = this.props;
    const colors = ['white', 'gray', 'black'];
    return (
      <div
        ref={this.ref}
        className="pixel-grid"
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        {...restProps}>
        {Array(rows)
          .fill(0)
          .map((ynone, y) => (
            <div className="pixel-row">
              {Array(cols)
                .fill(0)
                .map((xnone, x) => {
                  const value = pixels[y * cols + x];
                  return (
                    <div
                      className={
                        'pixel-cell' + (value < 0 ? ' pixel-solid' : '')
                      }
                      style={{
                        backgroundColor:
                          colors[Math.abs(value) % colors.length],
                      }}
                    />
                  );
                })}
            </div>
          ))}
      </div>
    );
  }

  handleMouseDown = e => {
    this.mouseDown = {
      button: e.button,
      x: e.clientX,
      y: e.clientY,
    };
    this.dragging = true;
    if (e.button == MOUSE_BUTTON_MIDDLE) {
      this.dragPixels = [...this.props.pixels];
    }
  };
  handleMouseMove = e => {
    if (this.dragging) {
      if (this.mouseDown.button == MOUSE_BUTTON_MIDDLE) {
        // drag
        const dx = e.clientX - this.mouseDown.x;
        const dy = e.clientY - this.mouseDown.y;
        if (dx * dx + dy * dy < CELL_SIZE) {
          return;
        }
        const ix = dx >> 3;
        const iy = dy >> 3;
        const pixels = [...this.dragPixels];
        console.log(dx, dy, ix, iy);
        const {rows, cols} = this.props;
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < cols; x++)
            pixels[
              ((y + rows + iy) % rows) * cols + (x + cols + ix) % cols
            ] = this.dragPixels[y * cols + x];
        this.onChange({pixels});
      } else if (this.mouseDown.button == MOUSE_BUTTON_LEFT) {
        //draw
        const {rows, cols, pixels} = this.props;
        const rect = e.target.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        const index = y * cols + x;
        if (this.mouseDown.value === undefined) {
          this.mouseDown.value = pixels[index];
        }
        pixels[index] = this.mouseDown.value;
        this.onChange({pixels});
      }
    }
  };
  handleMouseUp = e => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (this.mouseDown) {
      switch (this.mouseDown.button) {
        case MOUSE_BUTTON_RIGHT:
          this.setPixel(x, y, this.getPixel(x, y) * -1);
          break;
        case MOUSE_BUTTON_LEFT:
          const mouseDownX = Math.floor(
            (this.mouseDown.x - rect.left) / CELL_SIZE,
          );
          const mouseDownY = Math.floor(
            (this.mouseDown.y - rect.top) / CELL_SIZE,
          );
          if (x == mouseDownX && y == mouseDownY) {
            this.incrementPixel(x, y);
          }
          break;
      }
    }
    this.handleMouseDone(e);
  };
  handleMouseDone = e => {
    this.dragging = false;
    this.dragPixels = false;
  };
  getPixel = (x, y) => {
    const {cols, pixels} = this.props;
    return pixels[y * cols + x];
  };
  setPixel = (x, y, value) => {
    const {cols, pixels} = this.props;
    pixels[y * cols + x] = value;
    this.onChange({pixels: [...pixels]});
  };
  incrementPixel(x, y) {
    const value = this.getPixel(x, y);
    this.setPixel(x, y, (value + 1) % MAX_VALUE);
  }
  onChange = state => {
    this.props.onChange && this.props.onChange(state);
  };
}

export default withBulma('labeled-field')(PixelGrid);
