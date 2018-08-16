import React from 'react';
import PropTypes from 'prop-types';
import withBulma from '../decorators/withBulma';

class Dropdown extends React.Component {
  render() {
    return (
      <select
        name={this.props.name}
        onChange={this.props.onChange}
        selectedValue={this.props.value}>
        {this.props.items.map(({name, value}) => (
          <option value={value}>{name}</option>
        ))}
      </select>
    );
  }
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

export default withBulma('dropdown')(Dropdown);
