export interface ISettings 
{
    isProduction:boolean,
    accessToken:string,
    supportsTheming:boolean,
    searchEnabled:boolean,
    clearSomeoneIsTypingInterval:number
    allowedTypesFileUpload:string
    commentMaxLength: number
    maxFileSize: number
    maxStatusPreviewItems: number
}
export const Settings:ISettings = {
    isProduction : process.env.NODE_ENV === "production",
    accessToken:null,
    searchEnabled:true,
    maxFileSize: 400,
    supportsTheming: window.CSS && window.CSS.supports && window.CSS.supports("(--foo: red)"),
    clearSomeoneIsTypingInterval: 4000,
    allowedTypesFileUpload:"image/*,video/*,audio/*,application/pdf," +
    ".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pps,.ppsx,.xps,.odp,.ods,.odt,.rtf,.txt,.key," + // Docs
    ".css,.html,.php,.c,.cpp,.h,.hpp," + // Code
    ".dxf,.ai,.psd,.eps,.ps,.svg,.ttf,",
    commentMaxLength: 5000,
    maxStatusPreviewItems:5,
}