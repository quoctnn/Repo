import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { availableThemes, setThemeAction } from '../redux/theme';
import { WindowAppManager } from './WindowAppManager';
export abstract class ThemeManager
{
    static setup = () => 
    {
    }
    static setTheme = (index:number) => {
        const dispatch =  ThemeManager.getStore().dispatch
        dispatch(setThemeAction(index))
        ThemeManager.applyTheme(index)
        WindowAppManager.sendMessageElectron("themeUpdated", index)
    }
    private static applyTheme = (themeIndex: number) => {
        let theme = availableThemes[themeIndex];
        let selector = theme.selector;
        let root = document.querySelector(':root');
        if(root)
            root.className = selector;
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}