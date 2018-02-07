import React from 'react';
import dva , {connect} from 'dva';
import {proxyModel, proxyStateForUI, proxyMapDispatchToProps} from "./proxy";


export default function (opts = {}) {

    const app = dva();
    const model = app.model.bind(app);


    app.connect = function (getUIState, callbacks, mergeProps, options = {}) {

        return UI => {
            class ComponentWithPrefix extends React.Component {
                render() {
                    let prefix = this.props.prefix;

                    const mapStateToProps = (...args) => {
                        const [state, ...extArgs] = args;
                        return getUIState(proxyStateForUI(state, prefix), ...extArgs);
                    };
                    const mapDispatchToProps = proxyMapDispatchToProps(app, callbacks, prefix)

                    const Component = connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(UI);


                    return <Component {...this.props}/>;
                }
            }

            return ComponentWithPrefix;
        };
    }

    app.model = m => model(proxyModel(m));

    return app;
};
