import { AppLanguage } from '../types/intrasocial_types';
export enum LanguageActionTypes {
    SetLanguage = 'language.set_language',
}
const INITIAL_STATE = {
  language: AppLanguage.english
}
export interface SetLanguageAction{
    type:string
    language:AppLanguage
}
export const setLanguageAction = (language: AppLanguage):SetLanguageAction => ({
    type: LanguageActionTypes.SetLanguage,
    language
})
export const resetLanguageAction = ():SetLanguageAction => ({
  type: LanguageActionTypes.SetLanguage,
  language: AppLanguage.english
})
const language = (state = INITIAL_STATE, action:SetLanguageAction) => {
  switch (action.type) {
    case LanguageActionTypes.SetLanguage:
      return { ...state, language: action.language }
    default:
      return state
  }
};
export default language;
