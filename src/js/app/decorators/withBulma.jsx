import React from 'react';
const withBulma = (template) => (WrappedComponent) => {
   return class extends React.Component {
      render() {
          switch (template) {
              case 'label-input':
                  return (
                    <div class="field is-horizontal">
                      <div class="field-label is-normal">
                        <label class="label">{this.props.label}</label>
                      </div>
                      <div class="field-body">
                        <div class="field">
                          <p class="control">
                            <WrappedComponent {...this.props} />
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                  break;
            default:
                return null;
          }
      }
   }
}
export default withBulma;
