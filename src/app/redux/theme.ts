import { ReduxState } from './index';
import { ThemeManager } from '../managers/ThemeManager';
export enum ThemeActionTypes {
    SetTheme = 'theme.set_theme',
}
export interface StyleTheme {
  name: string;
  selector: string;
}
export const availableThemes: StyleTheme[] = [
  { name: 'Default', selector: '' },
  { name: 'Light', selector: 'light' },
  { name: 'Dark', selector: 'dark' }
]
const INITIAL_STATE = {
    theme: 0
}
export interface SetThemeAction{
    type:string
    theme:number
}
export const setThemeAction = (index: number):SetThemeAction => ({
    type: ThemeActionTypes.SetTheme,
    theme: index
})
export const theme = (state = INITIAL_STATE, action:SetThemeAction) => {
  switch (action.type) {
    case ThemeActionTypes.SetTheme:
      return { ...state, theme: action.theme }
    default:
      return state;
  }
}
export const themeSwitcherMiddleware = store => next => (action:SetThemeAction) => {
    let result = next(action);
    if (action.type === ThemeActionTypes.SetTheme) {
        let state = store.getState() as ReduxState
        ThemeManager.applyTheme(state.theme.theme)
    }
    return result;
}
