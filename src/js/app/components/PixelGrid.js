import React from 'react';
import {isNegative} from '../../lib/math';

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
    const {cols, rows, pixels, mirrorX, mirrorY, ...restProps} = this.props;
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
            <div className="pixel-row" key={y}>
              {Array(cols)
                .fill(0)
                .map((xnone, x) => {
                  const ix = mirrorX && x >= cols >> 1 ? cols - x - 1 : x;
                  const iy = mirrorY && y >= rows >> 1 ? rows - y - 1 : y;
                  const value = pixels[iy * cols + ix];
                  return (
                    <div
                      key={x}
                      className={
                        'pixel-cell' + (isNegative(value) ? ' pixel-solid' : '')
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
    const {rows, cols, mirrorX, mirrorY, pixels} = this.props;
    const rect = this.ref.current.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    let y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    if (mirrorX) {
      x = x % (cols >> 1);
    }
    if (mirrorY) {
      y = y % (rows >> 1);
    }
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
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < cols; x++)
            pixels[
              ((y + rows + iy) % rows) * cols + ((x + cols + ix) % cols)
            ] = this.dragPixels[y * cols + x];
        this.onChange({pixels});
      } else if (this.mouseDown.button == MOUSE_BUTTON_LEFT) {
        //draw
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
    const {cols, rows, mirrorX, mirrorY, pixels} = this.props;
    const ix = mirrorX && x >= cols >> 1 ? cols - 1 - x : x;
    const iy = mirrorY && y >= rows >> 1 ? rows - 1 - y : y;
    return pixels[iy * cols + ix];
  };
  setPixel = (x, y, value) => {
    const {cols, rows, mirrorX, mirrorY, pixels} = this.props;
    const ix = mirrorX && x >= cols >> 1 ? cols - 1 - x : x;
    const iy = mirrorY && y >= rows >> 1 ? rows - 1 - y : y;
    pixels[iy * cols + ix] = value;
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

export default PixelGrid;
