export enum ContactListActionTypes {
    SetContacts = 'contactlist.set_contacts',
    AppendContacts = 'contactlist.append_contacts',
    Reset = 'contactlist.reset',
}
export interface ContactListResetAction{
    type:string
}
export interface ContactListAddAction extends ContactListResetAction{
    contacts:number[]
}
export const contactListAppendAction = (contacts:number[]):ContactListAddAction => ({
    type: ContactListActionTypes.AppendContacts,
    contacts
})
export const contactListSetAction = (contacts:number[]):ContactListAddAction => ({
    type: ContactListActionTypes.SetContacts,
    contacts
})
export const contactListResetAction = ():ContactListResetAction => ({
    type: ContactListActionTypes.Reset
})
const contactsArray:number[] = []
const INITIAL_STATE = { contacts: contactsArray}
const contactListCache = (state = INITIAL_STATE, action:ContactListAddAction) => {
    switch(action.type)
    {
        case ContactListActionTypes.SetContacts:
        {
            return { ...state , contacts: [...action.contacts]}
        }
        case ContactListActionTypes.AppendContacts:
        {
            let arr = state.contacts.map( (content) => content).concat(action.contacts)
            return { ...state, contacts: arr}
        }
        case ContactListActionTypes.Reset:
            return { contacts: []}
        default:
            return state;
    }
}
export default contactListCache