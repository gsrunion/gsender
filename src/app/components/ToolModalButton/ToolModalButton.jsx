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
import cx from 'classnames';
import styles from './index.styl';


const ToolModalButton = ({ className, icon = 'fas fa-info', children, ...props }) => {
    return (
        <button className={cx(styles.toolModalButton, className)} {...props}>
            <div className={styles.toolModalButtonIcon}>
                <i className={icon} />
            </div>
            <div className={styles.toolModalButtonContent}>
                {children}
            </div>
        </button>
    );
};

export default ToolModalButton;