import _ from 'lodash';
import $ from 'webpack-zepto';

export default {


    // appConfig: null,
    windowData: null,
    mouseData: null,

    time: null,

    node: null,


    init(options) {

        // this.appConfig = options.appConfig;
        this.windowData = options.windowData;
        this.mouseData = options.mouseData;

        this.node = options.node;

        this.setup( options );
    },

    setup(options) {},

    createChild( childObject, node = null, options = {} ) {

        let child = Object.create( childObject );

        child.init({

            // 'appConfig': this.appConfig,
            'windowData': this.windowData,
            'mouseData': this.mouseData,
            'node': node,
            'config': options
        });

        return child;
    },

    resize() {},

    mouseMove() {},

    animFrame(t, options) {

        this.time = t;

        this.onAnimFrame(options);
    },

    onAnimFrame() {},

    applyCssTransform(element, transformString) {

        element.style.mozTransform = transformString;
        element.style.webkitTransform = transformString;
        element.style.transform = transformString;
    }

};