import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { NotificationCenter } from '../utilities/NotificationCenter';
import { EventStreamMessageType } from '../network/ChannelEventStream';
import { Favorite, ContextNaturalKey } from '../types/intrasocial_types';
import { addFavoritesAction, setFavoritesAction, removeFavoriteAction } from '../redux/favoriteStore';
import {ApiClient} from '../network/ApiClient';
import { ToastManager } from './ToastManager';
import { translate, lazyTranslate } from '../localization/AutoIntlProvider';
export abstract class FavoriteManager
{
    static setup()
    {
        NotificationCenter.addObserver('eventstream_' + EventStreamMessageType.FAVORITES_UPDATE, FavoriteManager.processFavoritesUpdate)
    }
    static processFavoritesUpdate = (...args:any[]) => {
        //TODO:Prevent reload when current app has caused the update
        ApiClient.getFavorites((data, status, error) => {
            if(data && data.results && !error)
            {
                FavoriteManager.setFavoritesToStore(data.results)
            }
        })
    }
    static toggleFavorite = () => {

    }
    static createFavorite = (objectNaturalKey: ContextNaturalKey, objectId: number) => {
        ApiClient.createFavorite(objectNaturalKey,objectId, null, (data, status, errorData) => {
            if(data)
            {
                FavoriteManager.addFavoritesToStore([data])
            }
            ToastManager.showRequestErrorToast(errorData, lazyTranslate("network.error"))
        })
    }
    static removeFavorite = (id: number) => {
        ApiClient.deleteFavorite(id, (data, status, error) => {
            if(!error)
            {
                FavoriteManager.removeFavoriteFromStore(id)
            }
            ToastManager.showRequestErrorToast(error, lazyTranslate("Could not remove item to your favorites"))
        })
    }
    static removeFavoriteFromStore = (id:number) => {
        FavoriteManager.getStore().dispatch(removeFavoriteAction(id))
    }
    static addFavoritesToStore = (favorites:Favorite[]) => {
        FavoriteManager.getStore().dispatch(addFavoritesAction(favorites))
    }
    static setFavoritesToStore = (favorites:Favorite[]) => {
        FavoriteManager.getStore().dispatch(setFavoritesAction(favorites))
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}