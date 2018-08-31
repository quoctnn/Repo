export interface ISettings 
{
    isProduction:boolean,
    accessToken:string,
    supportsTheming:boolean,
    searchEnabled:boolean,
    clearSomeoneIsTypingInterval:number,
}
export const Settings:ISettings = {
    isProduction : process.env.NODE_ENV === "production",
    accessToken:null,
    searchEnabled:true,
    supportsTheming: window.CSS && window.CSS.supports && window.CSS.supports("(--foo: red)"),
    clearSomeoneIsTypingInterval: 4000
}