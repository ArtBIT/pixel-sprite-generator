import React from 'react';
import PropTypes from 'prop-types';

const setNativeValue = (element, value) => {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    'value',
  ).set;

  if (valueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else {
    valueSetter.call(element, value);
  }
};
class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.state = {
      isOpen: false,
      value: props.value,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.value) {
      return {value: props.value};
    }
  }

  render() {
    const {items, name, onChange} = this.props;
    return (
      <div className={['dropdown', this.state.isOpen && 'is-active'].join(' ')}>
        <div className="dropdown-trigger">
          <button
            className="button"
            onClick={this.toggle}
            aria-haspopup="true"
            aria-controls="dropdown-menu">
            <span>{this.state.value} ▾</span>
          </button>
        </div>
        <div className="dropdown-menu" role="menu">
          <div className="dropdown-content">
            {items.map(({name, value}) => (
              <a
                key={value}
                href="#"
                className="dropdown-item"
                data-value={value}
                onClick={this.handleSelect}>
                {name}
              </a>
            ))}
          </div>
        </div>
        <input
          type="text"
          className="is-hidden"
          name={name}
          value={this.state.value}
          onChange={onChange}
          ref={this.ref}
        />
      </div>
    );
  }

  handleSelect = e => {
    const input = this.ref.current;
    const value = e.target.getAttribute('data-value');
    setNativeValue(input, value);
    this.setState({value});
    input.dispatchEvent(new Event('change', {bubbles: true}));
    this.close();
  };

  close = () => {
    this.setState({isOpen: false});
  };

  toggle = () => {
    this.setState({isOpen: !this.state.isOpen});
  };
}

Dropdown.propTypes = {
  // You can declare that a prop is a specific JS primitive. By default, these
  // are all optional.
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  items: PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  onChange: PropTypes.func,
};

export default Dropdown;
