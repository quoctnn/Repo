import { EventStreamManager } from './EventStreamManager';
import { ProfileManager } from './ProfileManager';
import { ConversationManager } from './ConversationManager';
import { AuthenticationManager } from './AuthenticationManager';
import { CommunityManager } from './CommunityManager';
const setupManagers = () => 
{
    AuthenticationManager.setup()
    EventStreamManager.setup()
    ProfileManager.setup()
    CommunityManager.setup()
    ConversationManager.setup()
}
export default setupManagers