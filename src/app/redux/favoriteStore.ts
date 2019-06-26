import { combineReducers } from 'redux'
import { Favorite } from "../types/intrasocial_types";
export enum FavoriteStoreActionTypes {
    AddFavorites = 'favoritestore.add_favorites',
    SetFavorites = 'favoritestore.set_favorites',
    RemoveFavorite = 'favoritestore.remove_favorite',
    Reset = 'favoritestore.reset',
}
export interface AddFavoritesAction{
    type:FavoriteStoreActionTypes
    favorites:Favorite[]
}
export interface RemoveFavoriteAction{
    type:FavoriteStoreActionTypes
    id:number
}
export interface ResetFavoritesAction{
    type:FavoriteStoreActionTypes
}
export const addFavoritesAction = (favorites: Favorite[]):AddFavoritesAction => ({
    type: FavoriteStoreActionTypes.AddFavorites,
    favorites
})
export const setFavoritesAction = (favorites: Favorite[]):AddFavoritesAction => ({
    type: FavoriteStoreActionTypes.SetFavorites,
    favorites
})
export const removeFavoriteAction = (id: number):RemoveFavoriteAction => ({
    type: FavoriteStoreActionTypes.RemoveFavorite,
    id
})
export const resetFavoritesAction = ():ResetFavoritesAction => ({
    type: FavoriteStoreActionTypes.Reset,
})
​const resetFavorites = (state, action:ResetFavoritesAction) => {
    
    return {};
}
​​const resetFavoriteIds = (state, action:ResetFavoritesAction) => {
    
    return []
}
const addFavorites = (state:{[key:string]:Favorite}, action:AddFavoritesAction) => {
    let favorites = action.favorites
    let newState = {  ...state }
    favorites.forEach(c => {
        newState[c.id] = c
    })
    return newState
}
const setFavorites = (state:{[key:string]:Favorite}, action:AddFavoritesAction) => {
    let favorites = action.favorites
    let newState = {}
    favorites.forEach(c => {
        newState[c.id] = c
    })
    return newState
}
const removeFavorite = (state:{[key:string]:Favorite}, action:RemoveFavoriteAction) => {
    let id = action.id
    let newState = {  ...state }
    const object = newState[id]
    if(!!object)
    {
        delete newState[id]
    }
    return newState
}
const addFavoriteIds = (state:number[], action:AddFavoritesAction) => {
    
    let favorites = action.favorites
    let newState = [...state]
    favorites.forEach(c => {
        let id = c.id
        if(state.indexOf(id) == -1)
        {
            newState.push(id)
        }
    })
    return newState
}
const setFavoriteIds = (state:number[], action:AddFavoritesAction) => {
    return action.favorites.map(f => f.id)
}
const removeFavoriteId = (state:number[], action:RemoveFavoriteAction) => {
    let id = action.id
    let newState = [...state]
    const index = newState.indexOf(id)
    if(index > -1)
    {
        newState.splice(index, 1)
    }
    return newState
}
export const favoritesById = (state = {}, action:ResetFavoritesAction & AddFavoritesAction & RemoveFavoriteAction ) => 
{
    switch(action.type) {
        case FavoriteStoreActionTypes.AddFavorites: return addFavorites(state, action);
        case FavoriteStoreActionTypes.SetFavorites: return setFavorites(state, action);
        case FavoriteStoreActionTypes.RemoveFavorite: return removeFavorite(state, action);
        case FavoriteStoreActionTypes.Reset: return resetFavorites(state, action)
        default : return state;
    }
}
export const allFavorites = (state:number[] = [], action) => 
{
    switch(action.type) {
        case FavoriteStoreActionTypes.AddFavorites: return addFavoriteIds(state, action)
        case FavoriteStoreActionTypes.SetFavorites: return setFavoriteIds(state, action)
        case FavoriteStoreActionTypes.RemoveFavorite: return removeFavoriteId(state, action)
        case FavoriteStoreActionTypes.Reset: return resetFavoriteIds(state, action)
        default : return state;
    }
}
export const favoriteStore = combineReducers({
    byId : favoritesById,
    allIds : allFavorites
})