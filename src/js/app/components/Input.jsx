import React from 'react';
import PropTypes from 'prop-types';

class Input extends React.Component {
  render() {
    const {className, ...restProps} = this.props;
    return (
      <input
        className={[
          ' text number password '.indexOf(restProps.type) >= 0 ? 'input' : '',
          className,
        ].join(' ')}
        {...restProps}
      />
    );
  }
}
Input.propTypes = {
  // You can declare that a prop is a specific JS primitive. By default, these
  // are all optional.
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  step: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
};

export default Input;
