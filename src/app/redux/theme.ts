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
const defaultTheme = 0
const INITIAL_STATE = {
    theme: defaultTheme
}
export interface SetThemeAction{
    type:string
    theme:number
}
export const setThemeAction = (index: number):SetThemeAction => ({
    type: ThemeActionTypes.SetTheme,
    theme: index
})
export const resetThemeAction = ():SetThemeAction => ({
  type: ThemeActionTypes.SetTheme,
  theme: defaultTheme
})
export const theme = (state = INITIAL_STATE, action:SetThemeAction) => {
  switch (action.type) {
    case ThemeActionTypes.SetTheme:
      return { ...state, theme: action.theme }
    default:
      return state;
  }
}
