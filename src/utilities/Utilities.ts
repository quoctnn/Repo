import { Settings } from './Settings';
export const getDomainName = (url:string) =>  {
    var url_parts = url.split("/")
    var domain_name_parts = url_parts[2].split(":")
    var domain_name = domain_name_parts[0]
    return domain_name
}
export const appendTokenToUrl = (url:string) => 
{
    if(url && Settings.accessToken)
    {
        let img = new URL(url)
        img.searchParams.set('token', Settings.accessToken);
        return img.href
    }
    return url
}