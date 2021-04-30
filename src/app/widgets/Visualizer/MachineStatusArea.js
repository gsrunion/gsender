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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import controller from 'app/lib/controller';
import styles from './machine-status-area.styl';
import UnlockAlarmButton from './UnlockAlarmButton';

/**
 * Control Area component displaying machine status
 * @param {Object} state Default state given from parent component
 * @param {Object} actions Actions object given from parent component
 */
export default class ControlArea extends Component {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object,
    }

    state = {
        currentAlarmIcon: 'fa-lock'
    }

    unlock = () => {
        controller.command('unlock');
    }

    handleHomeMachine = () => {
        controller.command('homing');
    }

    render() {
        const { controller, port } = this.props.state;
        const { state = {} } = controller;

        //Object to customize the message of the active machine state
        const message = {
            Idle: 'Idle',
            Run: 'Running',
            Hold: 'Hold',
            Jog: 'Jogging',
            Check: 'Check',
            Home: 'Homing',
            Sleep: 'Sleep',
            Alarm: 'Alarm',
            Disconnected: 'Disconnected',
        };

        /**
         * Function to output the machine state based on multiple conditions
         */
        const machineStateRender = () => {
            if (port) {
                if (this.props.state.controller.state !== undefined) {
                    if (this.props.state.controller.state.status !== undefined) {
                        let alarmCode = this.props.state.controller.state.status.alarmCode;
                        let softLimitsEnabled = this.props.state.controller.settings.settings.$20;
                        if (alarmCode === 2 && softLimitsEnabled === '1') {
                            return (
                                <div className={styles['machine-status-wrapper']}>
                                    <div className={styles['machine-Alarm']}>
                                        {state.status.activeState} ({state.status.alarmCode}){' '}
                                    </div>
                                    <UnlockAlarmButton newMessage="Click To Home Machine" onClick={this.handleHomeMachine} />
                                </div>
                            );
                        }
                    }
                }
                if (state.status?.activeState === 'Alarm') {
                    return (
                        <div className={styles['machine-status-wrapper']}>
                            <div className={styles['machine-Alarm']}>
                                {state.status.activeState} ({state.status.alarmCode}){' '}
                            </div>
                            <UnlockAlarmButton onClick={this.unlock} />
                        </div>
                    );
                } else if (state.status?.activeState === 'Check') {
                    return (
                        <div className={styles['machine-status-wrapper']}>
                            <div className={styles['machine-Jog']}>
                             Checking Gcode File...
                            </div>
                        </div>
                    );
                } {
                    return state.status?.activeState //Show disconnected until machine connection process is finished, otherwise an empty div is shown
                        ? (
                            <div className={styles[`machine-${state.status.activeState}`]}>
                                { message[state.status.activeState] }
                            </div>
                        )
                        : <div className={styles['machine-Disconnected']}>Disconnected</div>;
                }
            } else {
                return <div className={styles['machine-Disconnected']}>Disconnected</div>;
            }
        };

        return (
            <div className={styles['control-area']}>
                <div />
                {machineStateRender()}
                <div />
            </div>
        );
    }
}