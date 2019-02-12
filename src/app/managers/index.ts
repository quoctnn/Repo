import { EndpointManager } from './EndpointManager';
import { AuthenticationManager } from './AuthenticationManager';
import { EventStreamManager } from './EventStreamManager';
import { CommunityManager } from './CommunityManager';
import { ProfileManager } from './ProfileManager';
import { GroupManager } from './GroupManager';
import { ProjectManager } from './ProjectManager';
import { ToastManager } from './ToastManager';
const initializeManagers = () => 
{
    EndpointManager.setup()
    AuthenticationManager.setup()
    EventStreamManager.setup()
    CommunityManager.setup()
    ProfileManager.setup()
    GroupManager.setup()
    ProjectManager.setup()
    ToastManager.setup()
}
export default initializeManagers