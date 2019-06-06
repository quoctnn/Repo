import { ApiClientCallback } from "../network/ApiClient";

export type ReadObserverSaveFunc = (ids: number[], callback: ApiClientCallback<any>) => void
export class ReadObserver{
    onActiveStateChanged?:(isActive:boolean) => void = null
    private intersectionObserver:IntersectionObserver = null
    private activeObservables = new Map<Element, number>()
    private readRegister:number[] = []
    private readStorageKey:string = null
    private saveFunc:ReadObserverSaveFunc = null
    private saveInterval:number = 1000 * 60
    private saveTimer:NodeJS.Timer = null
    private errorCount:number = 0
    private errorLimit:number = 10
    private debug = false
    private isActive = true
    private sentReadRegister:number[] = []
    constructor(key:string, onSave:ReadObserverSaveFunc, saveIntervalInMilliSeconds?:number){
        this.saveFunc = onSave
        this.readStorageKey = "readstorage." + key 
        if(saveIntervalInMilliSeconds)
        {
            this.saveInterval = saveIntervalInMilliSeconds
        }
        window.addEventListener("beforeunload", this.save)
        window.addEventListener('focus', this.windowFocusChanged);
        window.addEventListener('blur', this.windowFocusChanged);
        this.windowFocusChanged()
        try {
            const data = localStorage && localStorage.getItem(this.readStorageKey)
            if(data)
            {
                const statusesRead = JSON.parse(data) as number[]
                if(statusesRead && Array.isArray(statusesRead))
                {
                    this.readRegister = statusesRead
                    this.updateTimer()
                }
            }
        } catch (error) {
                
        }
    }
    windowFocusChanged = () => {
        this.isActive = document.hasFocus()
        this.onActiveStateChanged && this.onActiveStateChanged(this.isActive)
        console.log("windowFocusChanged", this.isActive)
    }
    getReads = () => {
        return [...this.readRegister, ...this.sentReadRegister]
    }
    save = () => {
        if(this.readRegister.length == 0)
            return
        const reads = [...this.readRegister]
        this.readRegister = []
        try {
            localStorage && localStorage.setItem(this.readStorageKey, JSON.stringify(reads))
            this.saveFunc(reads, (data, status, error) => {
                if(!error)
                {
                    localStorage && localStorage.removeItem(this.readStorageKey)
                    this.sentReadRegister.push(...reads)
                }
                else {
                    this.errorCount += 1
                    this.readRegister.push(...reads)
                }
                this.updateTimer()
            })
        } catch (error) {
                
        }
    }
    private intersectionCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
        if(!this.isActive)
            return
        entries.forEach(entry => {
            const { isIntersecting } = entry;
            if (isIntersecting) 
            {
                const id = this.activeObservables.get(entry.target)
                if(id)
                {
                    this.readRegister.push(id)
                    this.updateTimer()
                    console.log(`object id:${id} is visible`)
                    const deleted = this.activeObservables.delete(entry.target)
                    this.intersectionObserver.unobserve(entry.target)
                }
            }
          });
    }
    observe = (id: number, element: Element) => {
        if(!!element && !!id && !this.readRegister.contains(id))
        {
            this.activeObservables.set(element, id)
            this.intersectionObserver && this.intersectionObserver.observe(element)
        }
    }
    clearObservables = () => {
        this.activeObservables.forEach((val, key) => {
            
            this.intersectionObserver.unobserve(key)
        })
        this.activeObservables.clear()
    }
    initialize = (root?:Element) => {
        const options = {
            rootMargin: '0px',
            root
        }
        this.intersectionObserver = new IntersectionObserver(this.intersectionCallback, options)
        if(this.debug)
        {
            (this.intersectionObserver.root as any).style.border = "2px solid #44aa44";
        }
        this.activeObservables.forEach((value, key) => {
            this.intersectionObserver.observe(key)
        })
    }
    cleanup = () => {
        this.clearTimer()
        window.removeEventListener("beforeunload", this.save)
        window.removeEventListener('focus', this.windowFocusChanged);
        window.removeEventListener('blur', this.windowFocusChanged);
        this.clearObservables()
        if(this.intersectionObserver)
            this.intersectionObserver.disconnect()
        this.intersectionObserver = null
    }
    private updateTimer = () => {
        if(this.errorCount >= this.errorLimit)
        {
            this.clearTimer()
            return
        }
        if(this.readRegister.length > 0)
        {
            this.setupTimer()
        }
        else {
            this.clearTimer()
        }
    }
    private setupTimer = () => {
        if(!this.saveTimer)
        {
            this.saveTimer = setInterval(this.save, this.saveInterval)
        }
    }
    private clearTimer = () => {
        if(this.saveTimer)
        {
            clearInterval(this.saveTimer)
            this.saveTimer = null
        }
    }
}