import { EventStreamManager } from './EventStreamManager';
import { ProfileManager } from './ProfileManager';
import { ConversationManager } from './ConversationManager';
import { AuthenticationManager } from './AuthenticationManager';
import { CommunityManager } from './CommunityManager';
import { StatusManager } from './StatusManager';
import { StoreManager } from './StoreManager';
import { ToastManager } from './ToastManager';
const setupManagers = () => 
{
    AuthenticationManager.setup()
    EventStreamManager.setup()
    ProfileManager.setup()
    CommunityManager.setup()
    ConversationManager.setup()
    StatusManager.setup()
    StoreManager.setup()
    ToastManager.setup()
}
export default setupManagers