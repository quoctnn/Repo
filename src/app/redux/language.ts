export enum LanguageActionTypes {
    SetLanguage = 'language.set_language',
}
export const availableLanguages = ['en', 'es', 'nb'];
const INITIAL_STATE = {
  language: 0
}
export interface SetLanguageAction{
    type:string
    language:number
}
export const setLanguageAction = (index: number):SetLanguageAction => ({
    type: LanguageActionTypes.SetLanguage,
    language: index
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
