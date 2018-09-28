import { UserProfile } from '../../../../reducers/profileStore';
import * as React from 'react';
import { translate } from '../../../intl/AutoIntlProvider';
import LoadingSpinner from '../../LoadingSpinner';
import ProfileItem from '../../ProfileItem';
import { ModalBody, Modal, ModalHeader, ModalFooter, Button } from 'reactstrap';
require("./StatusInteractionDialog.scss");
export interface InteractionDialogProps
{
    loading:boolean
    reactors:UserProfile[]
    reactions:{[id:string]:number[]}
    visible:boolean
    didClose:() => void
}
export class StatusInteractionDialog extends React.Component<InteractionDialogProps, {}> {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.likesLoading != this.props.loading
    }
    render()
    {
        let users = this.props.reactors
        return (<Modal toggle={this.props.didClose} id="status-interaction-dialog" zIndex={1070} isOpen={this.props.visible} className="full-height">
                <ModalHeader>
                    {translate("Users who reacted")}
                    <button type="button" className="close" onClick={this.props.didClose}
                        data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                        <span className="sr-only">Close</span>
                    </button>
                    
                </ModalHeader>
                <ModalBody className="vertical-scroll">
                    <div className="list-reactors row">
                        {
                            this.props.loading && <LoadingSpinner/>
                        }

                        { !this.props.loading &&
                        users.map((user) => {
                            return (
                                <ProfileItem key={user.id}
                                                itemClass="col-6 col-lg-4"
                                                profile={user}/>
                            )
                        })
                        }
                    </div>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </Modal>)
    }
}
