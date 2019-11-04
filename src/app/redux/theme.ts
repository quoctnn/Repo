export enum ThemeActionTypes {
    SetTheme = 'theme.set.theme',
    SetFontSize = 'theme.set.font-size',
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
const defaultTheme = 0
const defaultFontSize = 100//%
export type ReduxTheme = {
    theme:number
    fontSize:number
}
const INITIAL_STATE:ReduxTheme = {
    theme: defaultTheme,
    fontSize:defaultFontSize
}
export interface SetThemeAction{
    type:string
    theme:number
}
export interface SetFontSizeAction{
    type:string
    fontSize:number
}
export const setThemeAction = (index: number):SetThemeAction => ({
    type: ThemeActionTypes.SetTheme,
    theme: index
})
export const setFontSizeAction = (size: number):SetFontSizeAction => ({
    type: ThemeActionTypes.SetFontSize,
    fontSize: size
})
export const resetThemeAction = ():SetThemeAction => ({
  type: ThemeActionTypes.SetTheme,
  theme: defaultTheme
})
export const theme = (state = INITIAL_STATE, action:SetThemeAction & SetFontSizeAction):ReduxTheme => {
  switch (action.type) {
    case ThemeActionTypes.SetTheme:
      return { ...state, theme: action.theme }
    case ThemeActionTypes.SetFontSize:
      return { ...state, fontSize: action.fontSize }
    default:
      return state;
  }
}
