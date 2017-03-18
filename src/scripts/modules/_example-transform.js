import { _, $, BaseObject } from '../common';

import TweenMax from 'gsap';
import matrixMath from '../utils/animation/matrix_math';

export default Object.assign( Object.create( BaseObject ), {


    active: false,


    setup(options) {

        this.activate();
    },

    activate() {

        if ( this.active ) { return; }
        this.active = true;

        //
    },

    deactivate() {

        if ( !this.active ) { return; }
        this.active = false;

        //
    },

    resize() {

    },

    mouseMove() {

    },

    onAnimFrame() {

        if ( !this.active ) { return; }

        this.draw();
    },

    draw() {

        let time = this.time;

        let rotateZ = Math.sin( time * 0.00015 );

        let rotateZMatrix = matrixMath.getRotationZMatrix( rotateZ );
        let resultMatrix = matrixMath.getResultMatrix([ rotateZMatrix ]);

        let matrixString = matrixMath.getTransform3dString( resultMatrix );

        this.applyCssTransform( this.$node, matrixString );
    }

});