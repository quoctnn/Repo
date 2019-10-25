export enum ThemeActionTypes {
    SetTheme = 'theme.set_theme',
}
export interface StyleTheme {
  name: string;
  selector: string;
}
export const availableThemes: StyleTheme[] = [
  { name: 'Default', selector: '' },
  { name: 'Light - Compact', selector: 'light compact' },
  { name: 'Light - Normal', selector: 'light' },
  { name: 'Light - Bigger', selector: 'light increased' },
  { name: 'Light - Huge', selector: 'light huge' },
  { name: 'Dark - Compact', selector: 'dark compact' },
  { name: 'Dark - Normal', selector: 'dark' },
  { name: 'Dark - Bigger', selector: 'dark increased' },
  { name: 'Dark - Huge', selector: 'dark huge' }
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
