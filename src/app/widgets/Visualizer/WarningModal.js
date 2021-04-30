/*
 *     This file is part of gSender.
 *
 *     gSender is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     gSender is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import Modal from 'app/components/Modal';
import { Button } from 'app/components/Buttons';
import PropTypes from 'prop-types';

import { modalStyle, modalHeaderStyle, modalTitleStyle, modalBodyStyle, modalFooterStyle } from './modalStyle';

const WarningModal = ({ onContinue, onIgnoreWarning, onCancel, invalidLine }) => {
    return (
        <Modal
            size="md"
            onClose={onContinue}
            style={modalStyle}
            disableOverlay
        >
            <Modal.Header style={modalHeaderStyle}>
                <Modal.Title style={modalTitleStyle}>
                    Invalid Line Warning
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={modalBodyStyle}>
                <p style={{ marginTop: '1rem' }}>The following line in your G-Code seems to be invalid:</p>

                <p><code>{invalidLine}</code></p>

                <p>Your job might not run properly</p>
            </Modal.Body>
            <Modal.Footer style={modalFooterStyle}>
                <Button
                    // style={{ backgroundColor: '#3e85c7', color: 'white', backgroundImage: 'none' }}
                    onClick={onCancel}
                >
                    Cancel Job (Unload File)
                </Button>
                <Button
                    style={{ backgroundColor: '#3e85c7', color: 'white', backgroundImage: 'none' }}
                    onClick={onContinue}
                >
                    Continue Job
                </Button>
                <Button
                    style={{ backgroundColor: '#3e85c7', color: 'white', backgroundImage: 'none' }}
                    onClick={onIgnoreWarning}
                >
                    Continue Job and Ignore Future Warnings
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

WarningModal.propTypes = {
    onContinue: PropTypes.func,
    onIgnoreWarning: PropTypes.func,
    onCancel: PropTypes.func,
    invalidLine: PropTypes.string,
};

export default WarningModal;