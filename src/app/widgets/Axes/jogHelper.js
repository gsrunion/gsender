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

import _ from 'lodash';

class JogHelper {
    timeoutFunction = null;

    timeout = 250; //250ms

    startTime = 0;

    didPress = false;

    currentCoordinates = null;

    jog = null;

    continuousJog = null;

    stopContinuousJog = null;

    constructor({ jogCB, startContinuousJogCB, stopContinuousJogCB }) {
        this.jog = _.throttle(jogCB, 150, { trailing: false });
        this.continuousJog = _.throttle(startContinuousJogCB, 150, { trailing: false });
        this.stopContinuousJog = _.throttle(stopContinuousJogCB, 150, { trailing: false });

        // this.jog = jogCB;
        // this.continuousJog = startContinuousJogCB;
        // this.stopContinuousJog = stopContinuousJogCB;
    }

    onKeyDown(coordinates, feedrate) {
        const startTime = new Date();

        if (this.timeoutFunction) {
            return;
        }

        this.startTime = startTime;
        this.currentCoordinates = coordinates;

        this.timeoutFunction = setTimeout(() => {
            this.continuousJog(coordinates, feedrate);
        }, this.timeout);

        this.didPress = true;
    }

    onKeyUp(coordinates) {
        const timer = new Date() - this.startTime;

        if (!this.timeoutFunction) {
            return;
        }

        if (timer < this.timeout && this.didPress) {
            this.jog(coordinates);
            this.startTime = new Date();
            this.didPress = false;
            this.currentCoordinates = null;
        } else {
            this.stopContinuousJog();
            this.startTime = new Date();
            this.didPress = false;
            this.currentCoordinates = null;
        }

        clearTimeout(this.timeoutFunction);
        this.timeoutFunction = null;
    }
}

export default JogHelper;