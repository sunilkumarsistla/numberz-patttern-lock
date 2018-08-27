import ACTIONS from './action'

export const setPattern = pattern => dispatch => {
    dispatch({
        type: ACTIONS.SET_PATTERN,
        payload: pattern
    });
}

export const matchPattern = pattern => dispatch => {
    dispatch({
        type: ACTIONS.UNLOCK,
        payload: pattern
    });
}