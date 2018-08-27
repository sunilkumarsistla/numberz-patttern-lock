import ACTION from '../actions/action';

const initState = {
    pattern: [],
    status: '',
    fail_count: 0
};

const setPatternReducer = (state = initState, action) => {
    var message = '';
    var pattern = state.pattern;

    if(action.payload.length <= 0) {
        message = 'pattern is not set, use atleast 1 points for pattern';
        pattern = state.pattern
    } else {
        pattern = action.payload,
        message = 'new pattern is set'
    }

    return {
        ...state,
        pattern: pattern,
        status: message
    };
}
 
const validatePatternReducer = (state = initState, action) => {
    const isValid = (state.pattern.toString() === action.payload.toString());
    const message = (isValid ? '' : 'un-') + 'successful attempt';
    const failCount = isValid ? 0 : (state.fail_count + 1);
    return {
        ...state,
        fail_count: failCount,
        status: message 
    }
}

var reducerFactory = {};
reducerFactory[ACTION.SET_PATTERN] = setPatternReducer;
reducerFactory[ACTION.UNLOCK] = validatePatternReducer;

const defaultReducer = a => a;

export default (state = initState, action) => {
    return (reducerFactory[action.type] || defaultReducer)(state, action);
}