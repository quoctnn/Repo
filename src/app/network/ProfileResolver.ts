import { UserProfile, UserStatus } from '../types/intrasocial_types';
import {ApiClient} from './ApiClient';
import { translate } from '../localization/AutoIntlProvider';

export type ProfileRequestObject = {
    profiles:(number|string)[]
    completion:(profiles:UserProfile[]) => void
}
export abstract class ProfileResolver
{
    private static timeoutTimer:NodeJS.Timer = null
    private static requestDelay = 200
    private static requestObjects:ProfileRequestObject[] = []
    static resolveProfiles =  (profiles:(number|string)[], completion:(profiles:UserProfile[]) => void) => {
        ProfileResolver.scheduleRequestIfNeeded({profiles, completion})
    }

    private static scheduleRequestIfNeeded = (requestObject:ProfileRequestObject) => {

        if(!ProfileResolver.timeoutTimer)
            ProfileResolver.timeoutTimer = setTimeout(ProfileResolver.processRequests, ProfileResolver.requestDelay)
        ProfileResolver.requestObjects.push(requestObject)
    }
    private static processRequests = () => {
        const requests = ProfileResolver.requestObjects
        ProfileResolver.requestObjects = []
        ProfileResolver.timeoutTimer = null
        const result:(number|string)[] = []
        const requestIds = requests.reduce((result,request) => result.concat(request.profiles), result).distinct()
        ApiClient.getProfilesByIds(requestIds,(data, status, error) => {
            const results = data && data.results || []
            
            requests.forEach(r => {
                const profiles = r.profiles.map(p => {
                    const resolved:Partial<UserProfile> = results.find(u => {
                        if(p.isNumber())
                            return u.id == p
                        else 
                            return u.slug_name == p

                    }) 
                    /*|| 
                    {
                        id:p.isNumber() ? parseInt( p.toString() ) : -1,
                        slug_name:p.isNumber() ? "Unknown" : p.toString(),
                        unresolved_time:new Date().toUTCString(),
                        first_name:translate("Unknown"),
                        last_name:"",
                        user_status:UserStatus.invisible
                    }*/
                    return resolved as UserProfile
                }) 
                r.completion(profiles)
            })
        })
    }
}