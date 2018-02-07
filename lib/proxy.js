import _ from 'lodash'
const DEFAULT_PREFIX = '@hy';


export const proxyStateForUI = (st, prefix) => {
    const state = _.cloneDeep(st);
    Object.keys(state).map(namespace => {
        if (prefix && prefix[namespace]) {
            state[namespace] = state[namespace][prefix[namespace]];
        } else {
            state[namespace] = state[namespace][DEFAULT_PREFIX];
        }
    });
    return state;
};

export function proxyModel(m) {
    let {prefix, state, reducers} = m;
    prefix = (prefix && prefix.length > 0) ? prefix : [DEFAULT_PREFIX];
    return {
        ...m,
        prefix,
        state: proxyState(state, prefix),
        reducers: proxyReducers(reducers)
    }
}

export function proxyState(state, prefix) {

    return prefix.reduce((ret, key) => {
        ret[key] = state;
        return ret;
    }, {});
}
// 在state[prefix] 下更新数据
export function proxyReducers(reducers) {
    return Object.keys(reducers).reduce((ret, key) => {
        ret[key] = (state, action) => {
            const prefix = action.prefix;

            const result = reducers[key](state[prefix], action);

            return {
                ...state,
                [action.prefix]: {
                    ...result
                }
            };
        };
        return ret;
    }, {});
}

// dispatch时为action 附加一个参数prefix， prefix所在model根据action.type判断
// 使reducer可以在正确的位置更新状态
export const proxyDispatch = (dispatch, prefix) => {

    return action => {
        prefix = prefix ? prefix[action.type.split('/')[0]] : DEFAULT_PREFIX;
        dispatch({
            ...action,
            prefix,
        });
    };
};

// 拿到state[prefix]下的数据
export const proxyGetState = (getState, prefix) => {

    return () => {
        const state = {...getState()};

        Object.keys(state).map(namespace => {
            if (prefix && prefix[namespace]) {
                state[namespace] = state[namespace][prefix[namespace]];
            } else {
                state[namespace] = state[namespace][DEFAULT_PREFIX];
            }
        });


        return state;
    };
};

export const proxyMapDispatchToProps = (app, callbacks, prefix) => {
    const initializedCallbacks = {};

    return !callbacks ? undefined : function() {
        prefix = prefix || DEFAULT_PREFIX;
        const prefixCacheKey = JSON.stringify(prefix);

        if (!initializedCallbacks[prefixCacheKey]) {
            initializedCallbacks[prefixCacheKey] = {};

            invariant(
                _.isPlainObject(callbacks),
                'dva->$connect: callbacks should be plain object'
            );

            Object.keys(callbacks).map((key) => {

                invariant(
                    typeof callbacks[key] === 'function',
                    'dva->$connect: callbacks\'s each item should be function, but found ' + key
                );

                initializedCallbacks[prefixCacheKey][key] = function(...args) {
                    callbacks[key].call(null, {
                        getState: proxyGetState(app._store.getState, prefix),
                        dispatch: proxyDispatch(app._store.dispatch, key, prefix)
                    }, ...args);
                }
            });
        }
        return initializedCallbacks[prefixCacheKey];
    };
}