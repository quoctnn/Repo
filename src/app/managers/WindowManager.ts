import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { removeCommunityAction } from '../redux/communityStore';
import { resetProjectsAction } from '../redux/projectStore';
export type AppWindowObject = {
    deleteCommunity:(id:number) => void
    resetProjectStore:() => void
    user_locale?:string
}
export abstract class WindowManager
{
    static setup = () => 
    {
        window.app = {
            deleteCommunity:WindowManager.deleteCachedCommunity,
            resetProjectStore:WindowManager.resetProjectStore
        }
    }
    static resetProjectStore = () => {
        WindowManager.getStore().dispatch(resetProjectsAction())
    }
    static deleteCachedCommunity = (id:number) => {
        WindowManager.getStore().dispatch(removeCommunityAction(id))
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store 
    }
}