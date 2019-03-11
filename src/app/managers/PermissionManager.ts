import {  Store } from 'redux';
import { ReduxState } from '../redux';
import { Status, Permission , ContextNaturalKey} from '../types/intrasocial_types';
import { AuthenticationManager } from './AuthenticationManager';
import { CommunityManager } from './CommunityManager';
export abstract class PermissionManager
{
    static setup = () =>
    {
    }
    static permissionForStatus = (status:Status) => {
        if(status.community && status.community.id)
        {
            const comm = CommunityManager.getCommunityById(status.community.id)
            if(comm && comm.permission >= Permission.admin)
                return Permission.admin
        }
        else if(status.context_natural_key == ContextNaturalKey.USER && status.context_object_id == AuthenticationManager.getAuthenticatedUser().id){
            return Permission.admin
        }
        return status.permission
    }
    private static getStore = ():Store<ReduxState,any> =>
    {
        return window.store
    }
}