import {  Store } from 'redux';
import { RootState } from '../../reducers';
import { canSendOnWebsocket, addSocketEventListener, SocketMessageType } from '../../components/general/ChannelEventStream';
import * as Actions from '../../actions/Actions';
import { Status, StatusContextKeys } from '../../reducers/statuses';
class StatusManagerSingleton 
{
    constructor()
    {
        this.setup = this.setup.bind(this)
        this.getStore = this.getStore.bind(this)
        this.processTempQueue = this.processTempQueue.bind(this)
        this.sendStatus = this.sendStatus.bind(this)
        this.processIncomingNewStatus = this.processIncomingNewStatus.bind(this)
        this.processIncomingUpdateStatus = this.processIncomingUpdateStatus.bind(this)
    }
    setup()
    {
        addSocketEventListener(SocketMessageType.STATUS_NEW, this.processIncomingNewStatus)
        addSocketEventListener(SocketMessageType.STATUS_UPDATE, this.processIncomingUpdateStatus)
    }
    processTempQueue() 
    {
        if (canSendOnWebsocket) 
        {
            this.getStore().dispatch(Actions.queueProcessNextStatus())
        }
    }
    sendStatus(status:Status)
    {
        let store = this.getStore()
        store.dispatch(Actions.queueAddStatus(status))
    }
    private processIncomingUpdateStatus(event:CustomEvent)
    {
        let status = event.detail.data as Status
        this.insertStatus(status, false)
    }
    private processIncomingNewStatus(event:CustomEvent)
    {
        let status = event.detail.data as Status
        this.insertStatus(status, true)
    }
    private insertStatus(status:Status, isNew:boolean)
    {
        this.getStore().dispatch(Actions.insertStatus(StatusContextKeys.NEWSFEED, status, isNew)) //should be array of contexts. i.e. [NEWSFEED,COMMUNITY/5]
    }
    private getStore():Store<RootState,any>
    {
        return window.store 
    }
}
export let StatusManager = new StatusManagerSingleton();