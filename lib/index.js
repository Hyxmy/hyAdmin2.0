import React from 'react';
import dva , {connect as oldAppConnect} from 'dva';
import createHistory from 'history/createHashHistory';
import createLoading from 'dva-loading';

import {proxyModel, proxyStateForUI, proxyMapDispatchToProps} from "./proxy";
// import {isString, isHTMLElement} from "./utils";

export default function (opts = {}) {

    // 1. init
    const app = dva({
      history: createHistory(),
    });

    // 2. Plugins
    app.use(createLoading());

    const oldAppRouter = app.router.bind(app);
    const oldAppModel = app.model.bind(app);

    // 3 重写model、connect和start
    app.connect = connect;
    app.model = model;
    app.router = router;

    return app;

    function connect(getUIState, callbacks, mergeProps, options = {}) {

        return UI => {
            class ComponentWithPrefix extends React.Component {
                render() {
                    let prefix = this.props.prefix;

                    const mapStateToProps = (...args) => {
                        const [state, ...extArgs] = args;
                        return getUIState(proxyStateForUI(state, prefix), ...extArgs);
                    };
                    const mapDispatchToProps = proxyMapDispatchToProps(app, callbacks, prefix)

                    const Component = oldAppConnect(mapStateToProps, mapDispatchToProps, mergeProps, options)(UI);


                    return <Component {...this.props}/>;
                }
            }

            return ComponentWithPrefix;
        };
    }

    function model(m) {
      oldAppModel(proxyModel(m));
    }

    function router(callback) {
      oldAppRouter(({app, ...extraProps}) => {
        const injectModel = app.model.bind(app);
        app.model = m => injectModel(proxyModel(m));
        return callback({app, ...extraProps})
      });
    }
};
