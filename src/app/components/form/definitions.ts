export type FormComponentBaseProps = {
    title:string
    id:string
    isRequired?:boolean
    error?:string
    hasSubmitted?:boolean
    onValueChanged?:(id:string, value?:any) => void
    onRequestNavigation?:(title?:string, toView?:React.ReactNode) => void
}
export class FormComponentData implements FormComponentBaseProps{
    title:string
    id:string
    isRequired?:boolean
    error?:string
    hasSubmitted?:boolean
    constructor(title:string, id:string, isRequired?:boolean, hasSubmitted?:boolean){
        this.title = title
        this.id = id
        this.isRequired = isRequired
        this.hasSubmitted = hasSubmitted
    }
}