import store from 'app/store';
import controller from 'app/lib/controller';
import { METRIC_UNITS, STOCK_TURNING_METHOD } from 'app/constants';
import { Toaster, TOASTER_INFO } from 'app/lib/toaster/ToasterLib';

import defaultState from '../../../store/defaultState';

export class StockTurningGenerator {
    constructor(options) {
        const defaultOptions = defaultState.widgets.rotary.stockTurning.options;
        const newOptions = { ...defaultOptions, ...options };

        let method = STOCK_TURNING_METHOD.HALF_AND_HALF_SPIRALS;

        if (newOptions.stepdown >= newOptions.finalHeight) {
            method = STOCK_TURNING_METHOD.HALF_AND_HALF_SPIRALS;
        }

        if (newOptions.finalHeight % newOptions.stepdown === 0 || newOptions.enableRehoming) {
            method = STOCK_TURNING_METHOD.FULL_SPIRALS;
        } else {
            method = STOCK_TURNING_METHOD.HALF_AND_HALF_SPIRALS;
        }

        this.options = { ...newOptions, method };
    }

    generate = () => {
        const units = store.get('workspace.units');

        const { feedrate, method } = this.options;

        const wcs = controller.state?.parserstate?.modal?.wcs || 'G54';

        const headerBlock = [
            '(Header)',
            '(Generated by gSender from Sienci Labs)',
            ';Spiral Method: ' + method,
            wcs,
            units === METRIC_UNITS ? 'G21 ;mm' : 'G20 ;inches',
            `G1 F${feedrate}`,
            '(Header End)',
            '\n'
        ];

        const footerBlock = [
            '\n',
            '(Footer)',
            'M5 ;Turn off spindle',
            '(End of Footer)'
        ];

        const bodyBlock = this.generateLayers([], this.options.startHeight, 1);

        const arr = [
            ...headerBlock,
            ...bodyBlock,
            ...footerBlock
        ];

        // Convert to string so it can be interpreted by controller and visualizer
        const gcodeString = arr.join('\n');

        this.gcode = gcodeString;
    }

    generateLayers = (array, currentDepth, count) => {
        const { stepdown, finalHeight } = this.options;

        const layer = this.createLayer({ depth: currentDepth > finalHeight ? currentDepth : finalHeight, count });

        array.push(layer);

        if (currentDepth <= finalHeight) {
            return array.flat(); //Flatten out array at the end when all subset layers have been added
        }

        return this.generateLayers(array, currentDepth - stepdown, count + 1);
    }

    createLayer = ({ count, depth }) => {
        const { method } = this.options;

        const runSpiral = {
            [STOCK_TURNING_METHOD.HALF_AND_HALF_SPIRALS]: this.createHalfAndHalfSpiral,
            [STOCK_TURNING_METHOD.FULL_SPIRALS]: this.createFullSpiral,
        }[method];

        Toaster.pop({
            msg: `Spiral Method: ${method}`,
            type: TOASTER_INFO
        });

        if (!runSpiral) {
            throw new Error('Spiral Method Not Defined');
        }

        const layer = runSpiral(depth);

        return [
            `(*** Layer ${count} ***)`,
            ...layer,
            `(*** End of Layer ${count} ***)`,
            '\n'
        ];
    }

    createHalfAndHalfSpiral = (depth) => {
        const { finalHeight, feedrate, stockLength, stepover, bitDiameter } = this.options;
        const safeHeight = this.getSafeZValue();
        const halfOfStockLength = (stockLength / 2).toFixed(3);
        const throttledFeedrate = (feedrate * 0.2).toFixed(3);
        const stepoverPercentage = stepover / 100;

        const currentZValue = Number(controller.state.status.wpos.z) > 0
            ? Number(controller.state.status.wpos.z)
            : this.getDefaultCurrentZValue();

        const array = [
            /** 1 */ `G0 Z${safeHeight}`,

            /** 2 */ 'G0 X0 A0',

            /** 3 */ `G0 Z${depth} F${throttledFeedrate}`,

            /** 4 */ 'G91',

            /** 5 & 6 */
            depth <= finalHeight
                ? `G1 A-360 Z${-(currentZValue - finalHeight)} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`
                : 'G1 A-360',

            /** 7 */ `G1 X${halfOfStockLength} A${(0.5 * -360 * stockLength / (stepoverPercentage * bitDiameter)).toFixed(3)} F${(360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            /** 8 */ 'G1 A-360',

            /** 9 */ 'G90',

            /** 10 */ `G0 Z${safeHeight}`,

            /** 11 */ `G0 X${stockLength} F${throttledFeedrate}`,

            /** 12 */ `G0 Z${depth} F${throttledFeedrate}`,

            /** 13 */ 'G91',

            /** 14 */ `G1 A360 Z${-(currentZValue - finalHeight)} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            /** 15 */ 'G1 A360',

            /** 16 */ `G1 X${-halfOfStockLength} A${(0.5 * 360 * stockLength / (stepoverPercentage * bitDiameter)).toFixed(3)} F${(360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            /** 17 */ 'G1 A360',

            /** 18 */ 'G90',

            /** 19 */ `G0 Z${safeHeight}`,

            /** 20 */ 'G0 X0 A0'
        ];

        return array;
    }

    createFullSpiral = (depth) => {
        const { finalHeight, feedrate, stockLength, stepover, bitDiameter, stepdown, enableRehoming } = this.options;
        const safeHeight = this.getSafeZValue();
        const halfOfStockLength = (stockLength / 2).toFixed(3);
        const throttledFeedrate = (feedrate * 0.2).toFixed(3);
        const stepoverPercentage = stepover / 100;

        const currentZValue = Number(controller.state.status.wpos.z) > 0
            ? Number(controller.state.status.wpos.z)
            : this.getDefaultCurrentZValue();

        const array = [
            /** 1 */ `G0 Z${safeHeight}`,

            /** 2 */ 'G0 X0 A0',

            /** 3 */ 'G91',

            /** 4 */
            depth <= finalHeight
                ? `G1 A-360 Z${-currentZValue - finalHeight} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`
                : `G1 A-360 Z${-stepdown} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            /** 5 */ 'G1 A-360',

            /** 6 */ `G1 X${stockLength} A${-((360 * stockLength) / (stepover * bitDiameter)).toFixed(3)} F${((360 * feedrate) / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            /** 7 */ 'G1 A-360',

            // SKIP STEP 8 IF THERE IS ONLY A SINGLE STEPDOWN
            /** 8 */
            depth <= finalHeight
                ? `G1 A360 Z${-currentZValue - finalHeight} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`
                : `G1 A360 Z${-stepdown} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            'G1 A-360',

            `G1 X${-stockLength} A${((360 * stockLength) / (stepover * bitDiameter)).toFixed(3)} F${((360 * feedrate) / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

            // SKIP STEP 9 IF REHOMING IS ENABLED AND THERE ISNT AN ODD NUMBER OF STEPDOWNS
            /** 9 */
            !enableRehoming && [
                'G91',

                depth <= finalHeight
                    ? `G1 A-360 Z${-(currentZValue - finalHeight)} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`
                    : 'G1 A-360',

                `G1 X${halfOfStockLength} A${(0.5 * -360 * stockLength / (stepoverPercentage * bitDiameter)).toFixed(3)} F${(360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

                'G1 A-360',

                'G90',

                `G0 Z${safeHeight}`,

                `G0 X${stockLength} F${throttledFeedrate}`,

                `G0 Z${depth} F${throttledFeedrate}`,

                'G91',

                `G1 A360 Z${-(currentZValue - finalHeight)} F${(0.2 * 360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

                'G1 A360',

                `G1 X${-halfOfStockLength} A${(0.5 * 360 * stockLength / (stepoverPercentage * bitDiameter)).toFixed(3)} F${(360 * feedrate / (currentZValue * 2 * Math.PI)).toFixed(3)}`,

                'G1 A360',
            ],

            /** 10 */ 'G90',

            /** 11 */ `G0 Z${safeHeight}`,

            /** 12 */ 'G0 X0 A0'
        ];

        return array.flat();
    }

    getSafeZValue() {
        const { startHeight, usingBigMaterial } = this.options;
        const workspaceUnits = store.get('workspace.units');
        const zVal = workspaceUnits === METRIC_UNITS ? 3 : 0.12;

        if (usingBigMaterial) {
            return controller.settings.settings.$132;
        }

        return zVal + startHeight;
    }

    getDefaultCurrentZValue() {
        const workspaceUnits = store.get('workspace.units');
        const zVal = workspaceUnits === METRIC_UNITS ? 25 : 0.98;

        return zVal;
    }
}