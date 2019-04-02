import {EventEmitter, EventSubscription} from "fbemitter"
export abstract class NotificationCenter {
    static emitter = new EventEmitter()
    static debug = false
    static push(event:string, payload:any[])
    {
        if(this.debug)
        {
            console.log("listeners", this.emitter.listeners(event))
        }
        this.emitter.emit(event, ...payload)
    }
    static addObserver(event:string, listener: (...args: any[]) => void):EventSubscription
    {
        return this.emitter.addListener(event,listener)
    }
}