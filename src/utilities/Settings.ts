export interface ISettings 
{
    isProduction:boolean,
    accessToken:string
}
export const Settings:ISettings = {
    isProduction : process.env.NODE_ENV === "production",
    accessToken:null
}