import { _, $, BaseObject } from '../common';

import example from '../modules/_example';

export default Object.assign( Object.create( BaseObject ), {


    example: null,


    setup() {

        this.example = this.createChild( example, $('.js-example') );
    },

    resize() {

        this.example.resize();
    },

    mouseMove() {

        this.example.mouseMove();
    },

    onAnimFrame() {

        this.example.animFrame( this.time );
    }

});