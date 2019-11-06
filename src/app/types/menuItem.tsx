import { ContextNaturalKey, ContextObject } from './intrasocial_types';

export type MenuItem = {
    index:string
    title: string
    subtitle: string
    buttons: React.Component[]
    children: JSX.Element[]
}

export type ContextMenuItem = {
    filterField?: boolean
    searchField?: boolean
    contextNaturalKey?: ContextNaturalKey
    contextObject?: ContextObject
    contextId?: number
    parentId?: number
} & MenuItem
