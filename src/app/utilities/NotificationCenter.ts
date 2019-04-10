import {EventEmitter, EventSubscription} from "fbemitter"
import { Settings } from "./Settings";
export abstract class NotificationCenter {
    static emitter = new EventEmitter()
    static debug = true
    static push(event:string, payload:any[])
    {
        if(!Settings.isProduction)
        {
            const listeners = this.emitter.listeners(event)
            if(listeners.length == 0)
                console.warn("no listeners for event '" + event + "'")
        }
        this.emitter.emit(event, ...payload)
    }
    static addObserver(event:string, listener: (...args: any[]) => void):EventSubscription
    {
        return this.emitter.addListener(event,listener)
    }
}