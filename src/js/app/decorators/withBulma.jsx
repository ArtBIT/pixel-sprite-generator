import React from 'react';
const withBulma = template => WrappedComponent => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.ref = React.createRef();
    }
    render() {
      const props = this.props;
      switch (template) {
        case 'labeled-field':
          return (
            <div
              className={
                'field is-horizontal ' + (props.disabled ? 'is-disabled' : '')
              }>
              <div className="field-label is-normal">
                <label className="label">{props.label}</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control">
                    <WrappedComponent {...props} />
                  </p>
                </div>
              </div>
            </div>
          );
          break;
        case 'dropdown':
          const toggleDropdown = e => {
            this.ref.current.classList.toggle('is-active');
          };
          function setNativeValue(element, value) {
            const valueSetter = Object.getOwnPropertyDescriptor(
              element,
              'value',
            ).set;
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
          }
          const onSelect = e => {
            const input = this.ref.current.querySelector('input.fake');
            setNativeValue(input, e.target.getAttribute('data-value'));
            input.dispatchEvent(new Event('change', {bubbles: true}));
            toggleDropdown();
          };
          return (
            <div
              className={
                'field is-horizontal ' + (props.disabled ? 'is-disabled' : '')
              }>
              <div className="field-label is-normal">
                <label className="label">{props.label}</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control">
                    <div class="dropdown" ref={this.ref}>
                      <div class="dropdown-trigger">
                        <button
                          class="button"
                          onClick={toggleDropdown}
                          aria-haspopup="true"
                          aria-controls="dropdown-menu">
                          <span>{props.value} ▾</span>
                        </button>
                      </div>
                      <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                          {props.items.map(({name, value}) => (
                            <a
                              href="#"
                              class="dropdown-item"
                              data-value={value}
                              onClick={onSelect}>
                              {name}
                            </a>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        className="fake"
                        style={{display: 'none'}}
                        name={props.name}
                        value={props.value}
                        onChange={props.onChange}
                        ref={this.ref}
                      />
                    </div>
                  </p>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    }
  };
};
export default withBulma;
