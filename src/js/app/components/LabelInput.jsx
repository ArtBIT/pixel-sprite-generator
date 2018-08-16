import React from 'react';
import PropTypes from 'prop-types';
import withBulma from '../decorators/withBulma';

class LabelInput extends React.Component {
  render() {
    return <input {...this.props} />;
  }
}
LabelInput.propTypes = {
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

export default withBulma('labeled-field')(LabelInput);
