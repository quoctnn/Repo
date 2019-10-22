export type FormComponentBaseProps = {
    title:string
    id:string
    isRequired?:boolean
    errors?:(keys:string[]) => {[key:string]:string}
    hasSubmitted?:boolean
    onValueChanged?:(id:string, value:any, isRequired:boolean) => void
    onRequestNavigation?:(title?:string, toView?:React.ReactNode) => void
    isDisabled?:boolean
}