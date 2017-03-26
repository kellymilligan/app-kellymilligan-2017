import { _, $, BaseObject } from '../common';

import TweenMax from 'gsap';
import ProjectImages from '../data/project_images';

import EventDispatcher from '../lib/event-dispatcher';

import * as matrixHelpers from '../utils/dom/matrix_helpers';
import applyCssTransform from '../utils/dom/apply_css_transform';

import degToRad from '../utils/math/deg_to_rad';
import randomUnitSign from '../utils/math/random_unit_sign';


export default _.assign( _.create( BaseObject ), EventDispatcher, {


    isActive: false,
    isBlurred: false,
    isAnimating: false,
    isMaximised: false,

    index: -1,

    model: null,

    posHoriz: 0,
    posVert: 0,

    timeOffset: 0,

    placement: null,
    animation: null,

    image: null,


    setup: function (options) {

        _.bindAll( this, 'onClick', 'onMouseEnter', 'onMouseLeave', 'onAnimateOutComplete' );

        this.index = options.config.index;

        this.posHoriz = ( this.index === 0 || this.index === 2 ) ? -1 : 1;
        this.posVert = ( this.index === 0 || this.index === 1 ) ? -1 : 1;

        this.timeOffset = Date.now() / ( this.index + 1 );

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

            zoomS      : 0,
            zoomT      : 0,
            zoomRX     : 0,
            zoomRY     : 0,

            hover      : 0,

            blur       : 0
        };
    },

    addEvents: function () {

        this.node.on({
            'click'      : this.onClick,
            'mouseenter' :  this.onMouseEnter,
            'mouseleave' :  this.onMouseLeave
        });
    },

    removeEvents: function () {

        this.node.on({
            'click'      : this.onClick,
            'mouseenter' :  this.onMouseEnter,
            'mouseleave' :  this.onMouseLeave
        });
    },

    onClick: function () {

        this.dispatchEvent( { type: 'galleryItem:click', index: this.index } );
    },

    onMouseEnter: function () {

        this.hoverIn();
    },

    onMouseLeave: function () {

        this.hoverOut();
    },


    // State
    // -----

    update: function (id) {

        // Remove old image
        this.node.children( 'img' ).remove();

        // Load in new image
        this.model = _.find( ProjectImages, { id: id } );

        this.image = document.createElement( 'img' );
        this.image.onload = this.onImageLoaded.bind( this );
        this.image.src = this.model.images[ this.index ];

        this.activate(0);
    },

    onImageLoaded: function () {

        // console.log('loaded!', this.image);

        this.image.style.opacity = 0;
        this.node.append( this.image );

        TweenMax.to( this.image, 0.9, { 'opacity': 1 } );
    },

    activate: function (delay) {

        if ( this.isActive ) { return; }
        this.isActive = true;

        this.addEvents();

        this.resize();
        this.animateIn( delay );
    },

    deactivate: function (delay, callback) {

        if ( !this.isActive ) { return; }
        this.isActive = false;

        callback = callback !== undefined ? callback : function () {};

        this.removeEvents();

        this.animateOut( delay, callback );
    },

    maximise: function () {

        if ( this.isMaximised ) { return; }
        this.isMaximised = true;

        // this.dispatchEvent( { type: 'galleryItem:maximise' } );

        this.node.addClass('is-maximised');
        // console.log( 'add class' );

        this.zoomIn( function () {

        }.bind( this ) );
    },

    minimise: function () {

        if ( !this.isMaximised ) { return; }
        this.isMaximised = false;

        // this.dispatchEvent( { type: 'galleryItem:minimise' } );

        this.zoomOut( function () {

            if ( this.isMaximised ) { return; }

            this.node.removeClass('is-maximised');
            // console.log( 'remove class' );

            this.dispatchEvent( { type: 'galleryItem:minimiseComplete' } );

        }.bind( this ) );
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


    // State animation
    // ---------------

    animateIn: function (delay) {

        delay = delay || 0;

        // Only set new directions if animation previously finished
        if ( !this.isAnimating ) {

            this.animation.directionX = randomUnitSign();
            this.animation.directionY = randomUnitSign();
        }

        this.isAnimating = true;

        this.node[0].style.display = 'block';

        var offsetDelay = delay + Math.random() * 0.3;

        TweenMax.killTweensOf( this.animation, { 'progressR': true, 'progressZ': true, 'opacity': true } );

        TweenMax.to( this.animation, 1.8, {
            'progressR': 1,
            'progressZ': 1,
            'delay': offsetDelay,
            'ease': 'Quart.easeInOut'
        });

        TweenMax.to( this.animation, 1.8, {
            'opacity': 1,
            'delay': offsetDelay,
            'ease': 'Quart.easeIn'
        });
    },

    animateOut: function (delay, callback) {

        delay = delay || 0;

        this.isAnimating = true;

        var offsetDelay = Math.random() * 0.3;

        TweenMax.killTweensOf( this.animation, { 'progressR': true, 'progressZ': true, 'opacity': true } );

        TweenMax.to( this.animation, 1, {
            'progressR': 0,
            'progressZ': 0,
            'opacity': 0,
            'delay': offsetDelay,
            'ease': 'Quart.easeInOut',
            'onComplete': this.onAnimateOutComplete,
            'onCompleteParams': [ callback ]
        });
    },

    onAnimateOutComplete: function (callback) {

        this.isAnimating = false;

        this.node[0].style.display = 'none';

        callback();
    },

    zoomIn: function (callback) {

        TweenMax.killTweensOf( this.animation, { 'zoomS': true, 'zoomRX': true, 'zoomRY': true, 'zoomT': true } );

        var tD = 1.4;

        TweenMax.to( this.animation, tD * 0.2, { //'delay': tD * 0.25,
            'zoomRX': 1,
            'zoomRY': 1,
            'ease': 'Sine.easeInOut'
        });
        TweenMax.to( this.animation, tD * 0.8, { 'delay': tD * 0.2,
            'zoomRX': 0,
            'zoomRY': 0,
            'ease': 'Sine.easeInOut'
        });

        TweenMax.to( this.animation, tD * 0.25, {
            'zoomS': 0.25,
            'zoomT': 0.25,
            'ease': 'Cubic.easeIn'
        });

        TweenMax.to( this.animation, tD * 0.75, { 'delay': tD * 0.25,
            'zoomS': 1,
            'zoomT': 1,
            'ease': 'Cubic.easeOut'
        });

        TweenMax.delayedCall( tD, callback );
    },

    zoomOut: function (callback) {

        TweenMax.killTweensOf( this.animation, { 'zoomS': true, 'zoomRX': true, 'zoomRY': true, 'zoomT': true } );

        var tD = 1;

        TweenMax.to( this.animation, tD * 0.65, {
            'zoomRX': -0.9,
            'zoomRY': -0.9,
            'ease': 'Sine.easeInOut'
        });
        TweenMax.to( this.animation, tD * 0.35, { 'delay': tD * 0.65,
            'zoomRX': 0,
            'zoomRY': 0,
            'ease': 'Sine.easeInOut'
        });

        TweenMax.to( this.animation, tD, {
            'zoomS': 0,
            'zoomT': 0,
            'ease': 'Quart.easeInOut'
        });

        TweenMax.delayedCall( tD, callback );
    },

    hoverIn: function () {

        TweenMax.killTweensOf( this.animation, { 'hover': true } );

        var tD = 0.8;

        TweenMax.to( this.animation, tD, {
            'hover': 1,
            'ease': 'Cubic.easeOut'
        });
    },

    hoverOut: function () {

        TweenMax.killTweensOf( this.animation, { 'hover': true } );

        var tD = 0.8;

        TweenMax.to( this.animation, tD, {
            'hover': 0,
            'ease': 'Cubic.easeOut'
        });
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

    },

    onAnimFrame: function () {

        if ( this.isAnimating || this.isActive ) { this.draw(); }
    },


    // Animate
    // -------

    draw: function () {

        // Activation and ambient animation
        // ---
        var index = this.index + 1;

        var time = this.windowData.time + this.timeOffset;
        var t = time * 0.009;

        var progressX = ( 1 - this.animation.progressR ) * ( 15 * this.animation.directionX );
        var progressY = ( 1 - this.animation.progressR ) * ( 15 * this.animation.directionY );

        var translationMultiplier = this.appConfig.IS_MOBILE ? 0.7 : 1;

        var translateX = Math.sin( t * 0.1 ) * translationMultiplier;
        var translateY = Math.cos( t * 0.1 ) * translationMultiplier;

        var startingZ = 100;

        var translateZ = startingZ +
                            Math.sin( t * 0.05 ) * 5 +
                            ( ( 1 - this.animation.progressZ ) * -40 ) +
                            this.animation.blur * -100 +
                            this.animation.zoomS * 10;

        var rotateX = Math.sin( t * 0.03 * Math.cos( index ) ) * 6 + progressX;
        var rotateY = Math.cos( t * 0.03 * Math.sin( index ) ) * 6 + progressY;
        var rotateZ = Math.sin( t * 0.015 ) * ( this.appConfig.IS_MOBILE ? 1 : 2 );

        // Maximise animation
        // ---
        var mTranslateX = ( 1 - this.animation.zoomT ) * this.windowData.width * 0.2 * this.posHoriz;
        var mTranslateY = ( 1 - this.animation.zoomT ) * this.windowData.height * 0.25 * this.posVert;

        var mRotateX = -10 * this.posVert * this.animation.zoomRX;
        var mRotateY = 20 * this.posHoriz * this.animation.zoomRY;

        var scaleFactor = 0.25;
        var mScale = scaleFactor + this.animation.zoomS * ( 1 - scaleFactor );

        // Hover animation
        // ---
        var hRotateX = -3 * this.posVert * this.animation.hover * ( 1 - this.animation.zoomS ); // cancel out by maximise scale value
        var hRotateY = 6 * this.posHoriz * this.animation.hover * ( 1 - this.animation.zoomS ); // cancel out by maximise scale value

        var hScale = this.animation.hover * 0.01;

        // Construct and apply matrices
        // ---
        var translationMatrix = matrixHelpers.getTranslationMatrix(
            translateX + mTranslateX,
            translateY + mTranslateY,
            translateZ
        );

        var rotationXMatrix = matrixHelpers.getRotationXMatrix( degToRad(
            rotateX * ( 1 - this.animation.zoomS ) + mRotateX + hRotateX
        ) );
        var rotationYMatrix = matrixHelpers.getRotationYMatrix( degToRad(
            rotateY * ( 1 - this.animation.zoomS ) + mRotateY + hRotateY
        ) );
        var rotationZMatrix = matrixHelpers.getRotationZMatrix( degToRad(
            rotateZ * ( 1 - this.animation.zoomS )
        ) );

        var scaleMatrix = matrixHelpers.getScaleMatrix( mScale + hScale, mScale + hScale, 1 );

        var resultMatrix = matrixHelpers.getResultMatrix(
        [
            translationMatrix,
            rotationXMatrix,
            rotationYMatrix,
            rotationZMatrix,
            scaleMatrix
        ] );

        var matrixString = matrixHelpers.getTransformString( resultMatrix );

        applyCssTransform( this.node, matrixString );
        this.node[0].style.opacity = this.animation.opacity * ( 0.2 + ( 1 - this.animation.blur ) * 0.8 );

        // // Avoid z clipping on IOS
        // if ( this.appConfig.IS_IOS ) { translateZ += 40; }
    }

});