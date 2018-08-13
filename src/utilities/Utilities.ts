export const getDomainName = (url:string) =>  {
    var url_parts = url.split("/")
    var domain_name_parts = url_parts[2].split(":")
    var domain_name = domain_name_parts[0]
    return domain_name
}