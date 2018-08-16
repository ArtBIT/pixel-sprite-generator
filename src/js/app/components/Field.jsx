import React from 'react';
class Field extends React.Component {
  render() {
    const props = this.props;
    return (
      <div
        className={[
          'field',
          props.isVertical ? 'is-vertical' : 'is-horizontal',
          props.disabled && 'is-disabled',
          props.className,
        ].join(' ')}>
        {props.children}
      </div>
    );
  }
}

Field.Label = props => (
  <div className="field-label is-normal">
    <label className="label">{props.children}</label>
  </div>
);

Field.Control = props => (
  <div className="field-body">
    <div className="field">
      <p className="control">{props.children}</p>
    </div>
  </div>
);

export default Field;
