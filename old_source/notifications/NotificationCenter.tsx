var EventEmitter = require('events')
export abstract class NotificationCenter {
    static emitter = new EventEmitter()
    static push(event:string, payload:any[])
    {
        this.emitter.emit(event, ...payload)
    }
    static addObserver(event:string, listener: (...args: any[]) => void)
    {
        this.emitter.addListener(event,listener)
    }
    static removeObserver(event:string, listener: (...args: any[]) => void)
    {
        this.emitter.removeListener(event,listener)
    }
}
