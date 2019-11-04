import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { availableThemes, setThemeAction, setFontSizeAction } from '../redux/theme';
import { WindowAppManager } from './WindowAppManager';
import { AuthenticationManager } from './AuthenticationManager';
export abstract class ThemeManager
{
    static setup = () =>
    {
    }
    static initialize = () => {
        const state = ThemeManager.getStore().getState()
        const themeIndex = state.theme.theme || 0;
        const fontSize = state.theme.fontSize || 16
        ThemeManager.setTheme(themeIndex)
        ThemeManager.setFontSize(fontSize)
    }
    static setFontSize = (size:number) => {
        const dispatch =  ThemeManager.getStore().dispatch
        dispatch(setFontSizeAction(size))
        ThemeManager.applyFontSize(size)
    }
    static setTheme = (index:number | string) => {
        if (typeof(index) === "string") {
            index = ThemeManager.resolveThemeIndex(index)
        }
        const dispatch =  ThemeManager.getStore().dispatch
        dispatch(setThemeAction(index))
        ThemeManager.applyTheme(index)
        WindowAppManager.sendMessageElectron("themeUpdated", index)
        AuthenticationManager.saveProfileTheme(index)
    }
    static getCurrentTheme = () => {
        return availableThemes[ThemeManager.getStore().getState().theme.theme]
    }
    static resolveThemeIndex = (selector: string) => {
        const selected = availableThemes.find((theme) => theme.selector === selector)
        return selected ? availableThemes.indexOf(selected) : 0
    }
    private static applyTheme = (themeIndex: number) => {
        let theme = availableThemes[themeIndex];
        let selector = theme.selector;
        let root = document.querySelector(':root');
        if(root)
            root.className = selector;
    }
    private static applyFontSize = (size: number) => {
        let root:HTMLElement = document.querySelector(':root');
        if(root)
            root.style.fontSize = size + "%";
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}