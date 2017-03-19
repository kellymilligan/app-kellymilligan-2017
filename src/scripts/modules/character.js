import { _, $, BaseObject } from '../common'; 

import TweenMax from 'gsap';

import EventDispatcher from '../lib/event-dispatcher';
import wrapCharacters from '../utils/dom/wrap_characters';
import Character from '../modules/character';

import matrixTransform from '../utils/animation/matrix_math';
import applyMatrixCss from '../utils/animation/apply_matrix_css';

import randomUnitSign from '../utils/math/random_unit_sign';


export default Object.assign( Object.create( BaseObject ), EventDispatcher, {


    isActive: false,
    isBlurred: false,
    isAnimating: false,

    index: -1,
    localIndex: -1,

    intensity: 1,
    debug: false,
    isPageNav: false,

    timeOffset: 0,

    placement: null,
    animation: null,

    distTarget: 1,
    distCurrent: 1,

    $anim: null,


    setup: function (options) {

        _.bindAll( this, 'resize', 'activate', 'deactivate', 'onAnimationComplete' );

        this.index = options.config.index;
        this.localIndex = options.config.localIndex;

        this.intensity = options.config.intensity || this.intensity;

        this.debug = options.config.debug || false;
        this.isPageNav = options.config.isPageNav || false;

        this.placement = {

            w : 0,
            h : 0,
            x : 0,
            y : 0
        };

        this.animation = {

            opacity    : 0,
            progressR  : 0,
            progressZ  : 0,
            directionX : 0,
            directionY : 0,

            blur       : 0
        };

        this.timeOffset = Date.now() / ( this.index + 1 );

        this.$anim = this.node.children().eq(1);
    },


    // State
    // -----

    activate: function (timeScale, timeDelay) {

        if ( this.isActive ) { return; }
        this.isActive = true;

        this.resize();
        this.animateIn( timeScale, timeDelay );
    },

    deactivate: function (timeScale) {

        if ( !this.isActive ) { return; }
        this.isActive = false;

        this.animateOut( timeScale );
    },

    blur: function () {

        if ( this.isBlurred ) { return; }
        this.isBlurred = true;

        TweenMax.killTweensOf( this.animation, { 'blur': true } );
        TweenMax.to( this.animation, 0.6, { 'blur': 1 } );
    },

    focus: function () {

        if ( !this.isBlurred ) { return; }
        this.isBlurred = false;

        TweenMax.killTweensOf( this.animation, { 'blur': true } );
        TweenMax.to( this.animation, 0.6, { 'delay': 0.4, 'blur': 0 } );
    },


    // Update
    // ------

    resize: function () {

        this.placement.w = this.node.width();
        this.placement.h = this.node.height();

        var offset = this.node.offset();

        var centerX = ( offset.left + ( this.placement.w * 0.5 ) );
        var centerY = ( offset.top + ( this.placement.h * 0.5 ) );

        this.placement.x = ( centerX / this.windowData.width ) * 2 - 1;
        this.placement.y = ( centerY / this.windowData.height ) * 2 - 1;
    },

    mouseMove: function () {

        var diffX = this.mouseData.nX - this.placement.x;
        var diffY = this.mouseData.nY - this.placement.y;

        this.distTarget = Math.min( Math.sqrt( diffX * diffX + diffY * diffY ), 1 );
    },

    onAnimFrame: function () {

        if ( this.isAnimating || this.isActive ) { this.draw(); }
    },


    // Tweens
    // ------

    animateIn: function (timeScale, timeDelay) {

        timeScale = timeScale || 1;
        timeDelay = timeDelay === undefined ? 1.5 : timeDelay;

        // Only set new directions if animation previously finished
        if ( !this.isAnimating ) {

            this.animation.directionX = randomUnitSign();
            this.animation.directionY = randomUnitSign();
        }

        this.isAnimating = true;

        var delay = timeDelay + Math.random() * 0.45;

        TweenMax.killTweensOf( this.animation, { 'progressR': true, 'progressZ': true, 'opacity': true } );

        TweenMax.to( this.animation, 2.3 * timeScale, {
            'progressR': 1,
            'progressZ': 1,
            'delay': delay,
            'ease': 'Quart.easeInOut'
        });

        TweenMax.to( this.animation, 2.3 * timeScale, {
            'opacity': 1,
            'delay': delay,
            'ease': 'Quart.easeIn',
            'onComplete': this.onAnimationComplete
        });
    },

    animateOut: function (timeScale) {

        timeScale = timeScale || 1;

        this.isAnimating = true;

        var delay = Math.random() * 0.45;

        TweenMax.killTweensOf( this.animation, { 'progressR': true, 'progressZ': true, 'opacity': true } );

        TweenMax.to( this.animation, 1.9 * timeScale, {
            'progressR': 0,
            'progressZ': 0,
            'opacity': 0,
            'delay': delay,
            'ease': 'Quart.easeInOut',
            'onComplete': this.onAnimationComplete
        });
    },

    onAnimationComplete: function () {

        this.dispatchEvent( { type: 'characterAnimComplete', characterIndex: this.index } );

        this.isAnimating = false;
    },


    // Animation
    // ---------

    draw: function () {

        var time = this.time + this.timeOffset;
        var index = this.index + 1;

        this.distCurrent += ( this.distTarget - this.distCurrent ) * 0.1;

        // var timeAdjuster = Math.max( ( 1 - this.distCurrent ), 0 ) * 0.0005;
        var t = time * 0.009;

        var progressX = ( 1 - this.animation.progressR ) * ( 25 * this.animation.directionX );
        var progressY = ( 1 - this.animation.progressR ) * ( 25 * this.animation.directionY );

        var rotateX = Math.sin( t * 0.03 * Math.cos( index ) ) * 12 + progressX;
        var rotateY = Math.cos( t * 0.03 * Math.sin( index ) ) * 12 + progressY;

        var rotateZ = Math.sin( t * 0.015 ) * ( this.appConfig.IS_MOBILE ? 2 : 3 );

        var rotateXMatrix = matrixTransform.getRotationXMatrix( rotateX * this.intensity );
        var rotateYMatrix = matrixTransform.getRotationYMatrix( rotateY * this.intensity );
        var rotateZMatrix = matrixTransform.getRotationZMatrix( rotateZ * this.intensity );

        var translationMultiplier = this.appConfig.IS_MOBILE ? 0.7 : 1;

        var translateX = Math.sin( t * 0.1 ) * translationMultiplier;

        var transYOffset = ( ( this.appConfig.IS_IOS && this.appConfig.IS_SAFARI && this.isPageNav ) ? ( this.windowData.width > this.windowData.height ? -200 : -400 ) : 0 );

        var translateY = Math.cos( t * 0.1 ) * translationMultiplier +
                            ( this.appConfig.IS_MOBILE ) ? transYOffset * 0.05 : transYOffset;

        var proximity = ( 0.5 - Math.min( this.distCurrent, 0.5 ) );
        var proximityZ = this.appConfig.IS_MOBILE ? 80 : 40;
        var startingZ = this.appConfig.IS_SAFARI ? 60 : 0;

        var translateZ = startingZ +
                            Math.sin( t * 0.05 ) * 5 +
                            ( proximity * proximityZ ) +
                            ( ( 1 - this.animation.progressZ ) * -40 ) +
                            this.animation.blur * -40;

        // Avoid z clipping on IOS
        if ( this.appConfig.IS_IOS ) { translateZ += 40; }

        var translateMatrix = matrixTransform.getTranslationMatrix( translateX * this.intensity, translateY * this.intensity, translateZ );

        var resultMatrix = matrixTransform.getResultMatrix( [ translateMatrix, rotateXMatrix, rotateYMatrix, rotateZMatrix ] );

        var matrixString = matrixTransform.getTransform3dString( resultMatrix );

        applyMatrixCss( this.$anim[0], matrixString );
        this.$anim[0].style.opacity = this.animation.opacity * ( 0.2 + ( 1 - this.animation.blur ) * 0.8 );
    }

});