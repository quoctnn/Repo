import {  Store } from 'redux';
import { RootState } from '../reducers';
import * as Actions from '../actions/Actions';
import {StatusContextKeys } from '../reducers/statuses';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Status } from '../types/intrasocial_types';
import { EventStreamMessageType, canSendOnWebsocket } from '../app/network/ChannelEventStream';
export abstract class StatusManager
{
    static setup = () => 
    {
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.STATUS_NEW, StatusManager.processIncomingNewStatus)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.STATUS_UPDATE, StatusManager.processIncomingUpdateStatus)
        NotificationCenter.addObserver("eventstream_" + EventStreamMessageType.STATUS_DELETED, StatusManager.processIncomingDeleteStatus)
    }
    static processTempQueue = () => 
    {
        if (canSendOnWebsocket) 
        {
            StatusManager.getStore().dispatch(Actions.queueProcessNextStatus())
        }
    }
    static sendStatus = (status:Status) => 
    {
        let store = StatusManager.getStore()
        store.dispatch(Actions.queueAddStatus(status))
    }
    private static processIncomingUpdateStatus = (...args:any[]) => 
    {
        let status = args[0] as Status
        StatusManager.insertStatus(status, false)
    }
    private static processIncomingDeleteStatus = (...args:any[]) => {

        let data:{id:number} = args[0]
        StatusManager.removeStatus(data.id)
    }
    private static processIncomingNewStatus = (...args:any[]) => 
    {
        let status = args[0] as Status
        StatusManager.insertStatus(status, true)
    }
    private static insertStatus = (status:Status, isNew:boolean) => 
    {
        StatusManager.getStore().dispatch(Actions.insertStatus(StatusContextKeys.NEWSFEED, status, isNew)) //should be array of contexts. i.e. [NEWSFEED,COMMUNITY/5]
    }
    static removeStatus = (statusId:number) => 
    {
        StatusManager.getStore().dispatch(Actions.removeStatus(statusId)) //should be array of contexts. i.e. [NEWSFEED,COMMUNITY/5]
    }
    static setStatusReaction = (status:Status, reactions:{ [id: string]: number[] },reaction_count:number) => 
    {
        StatusManager.getStore().dispatch(Actions.setStatusReactions(status, reactions,  reaction_count))
    }
    private static getStore = ():Store<RootState,any> => 
    {
        return window.store 
    }
}