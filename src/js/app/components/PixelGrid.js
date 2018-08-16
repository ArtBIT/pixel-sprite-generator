import React from 'react';

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
  }
  render() {
    const {cols, rows, pixels, ...restProps} = this.props;
    const colors = ['white', 'gray', 'black'];
    return (
      <div className="pixel-grid" {...restProps} ref={this.ref}>
        {Array(rows)
          .fill(0)
          .map((ynone, y) => (
            <div className="pixel-row">
              {Array(cols)
                .fill(0)
                .map((xnone, x) => (
                  <div
                    className="pixel-cell"
                    style={{
                      backgroundColor:
                        colors[pixels[y * cols + x] % colors.length],
                    }}
                  />
                ))}
            </div>
          ))}
      </div>
    );
  }
}

export default PixelGrid;
