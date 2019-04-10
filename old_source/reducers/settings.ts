import { Types } from '../utilities/Types';
export interface StyleTheme {
  name: string;
  selector: string;
}
export const availableThemes: StyleTheme[] = [
  { name: 'Default', selector: '' },
  { name: 'Light', selector: 'light' },
  { name: 'Dark', selector: 'dark' }
];

export const availableLanguages = ['en', 'es', 'nb'];
const INITIAL_STATE = {
  language: 0,
  awayTimeout: 300,
  theme: 0
};
const settings = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.SET_LANGUAGE:
      return { ...state, language: action.language };
    case Types.SET_THEME:
      return { ...state, theme: action.theme };
    case Types.SET_AWAY_TIMEOUT:
      return { ...state, awayTimeout: action.timeout };
    default:
      return state;
  }
};
export default settings;
