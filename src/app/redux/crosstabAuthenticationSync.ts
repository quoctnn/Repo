// @flow
import { KEY_PREFIX } from 'redux-persist/lib/constants'
import { AuthenticationData } from './authentication';
import { AuthenticationManager } from '../managers/AuthenticationManager';

const getState = (value:string) => {
    const statePartial: { [key:string]: string } = JSON.parse(value)

    const state: Object = Object.keys(statePartial).reduce((state, reducerKey) => {
        state[reducerKey] = JSON.parse(statePartial[reducerKey])
        return state
    }, {})
    return state
}
export const activateCrosstabAuthenticationSync = () => {
  const keyPrefix: string = KEY_PREFIX

  const key = "authentication"

  window.addEventListener('storage', handleStorageEvent, false)

    function handleStorageEvent (e) {
        if (e.key && e.key == `${keyPrefix}${key}`) 
        {
            if (e.oldValue === e.newValue) {
                return
            }
            const oldState = getState(e.oldValue) as AuthenticationData
            const newState = getState(e.newValue) as AuthenticationData
            if(oldState.token != newState.token)
            {
                AuthenticationManager.signIn(newState.token)
            }
        }
    }
}