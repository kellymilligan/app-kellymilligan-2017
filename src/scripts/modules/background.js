import { _, $, BaseObject } from '../common'; 
import TweenMax from 'gsap';
import * as THREE from 'three';

import BackgroundVertexShader from 'raw!../shaders/background.vert';
import BackgroundFragmentShader from 'raw!../shaders/background.frag';

export default Object.assign( Object.create( BaseObject ), {


    $root     : null,
    $canvas   : null,

    renderer  : null,
    scene     : null,
    camera    : null,

    uniforms  : null,

    material  : null,
    mesh      : null,

    startTime : null,


    // Setup
    // -----

    setup: function (options) {

        if ( this.appConfig.IS_IE10 ) {

            this.show = function () {};
            this.blend = function () {};
            this.unblend = function () {};
            this.resize = function () {};
            this.mouseMove = function () {};
            this.onAnimFrame = function () {};

            return;
        }

        this.$root = options.$root;
        this.$canvas = this.node.find('.js-background__canvas');

        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: this.$canvas[0] });
        this.renderer.setSize( this.windowData.insetWidth, this.windowData.insetHeight );
        // this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();

        this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

        // this.node.append( this.renderer.domElement );

        this.setupShader();

        this.resize();
        this.render();
        this.show();

        this.startTime = Date.now();
    },

    setupShader: function () {

        this.uniforms = {
            'time':              { type: 'f', value: 1.0 },
            'windowRes':         { type: 'v2', value: new THREE.Vector2() },
            'windowRatio':       { type: 'f', value: this.windowData.ratio },
            'mousePos':          { type: 'v2', value: new THREE.Vector2() },
            'mousePosSmooth':    { type: 'v2', value: new THREE.Vector2() },
            'showProgress':      { type: 'f', value: 0.0 },
            'blendProgress':     { type: 'f', value: 0.0 },
            // Config
            'DETAIL_LEVEL':      { type: 'f', value: 1.0 },
            'DEFORMATION_LEVEL': { type: 'f', value: 1.0 },
            'FLOW_SPEED':        { type: 'f', value: 1.0 },
            'PROXIMITY_RADIUS':  { type: 'f', value: 1.0 }
        };

        this.material = new THREE.ShaderMaterial(
        {
            uniforms: this.uniforms,
            vertexShader: BackgroundVertexShader,
            fragmentShader: BackgroundFragmentShader,
        });

        this.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), this.material );

        this.scene.add( this.mesh );
    },

    setShaderConfigUniforms: function () {

        this.uniforms.DETAIL_LEVEL.value      = this.appConfig.IS_MOBILE ? 0.09 : 0.18;
        this.uniforms.DEFORMATION_LEVEL.value = this.appConfig.IS_MOBILE ? 1.0 : 1.2;
        this.uniforms.FLOW_SPEED.value        = this.appConfig.IS_MOBILE ? 1.0 : 1.0;
        this.uniforms.PROXIMITY_RADIUS.value  = this.appConfig.IS_MOBILE ? 1.2 : 1.6;
    },


    // State
    // -----

    show: function () {

        TweenMax.to( this.uniforms.showProgress, 2, {
            'value': 1.0,
            'ease': 'Sine.easeIn',
            'onStart': function () { this.$canvas[0].style.opacity = 1; }.bind(this)
        });
    },

    blend: function () {

        TweenMax.killTweensOf( this.uniforms.blendProgress );
        TweenMax.to( this.uniforms.blendProgress, 4, {
            'value': 1.0,
            'ease': 'Cubic.easeInOut'
        });

        this.$root.addClass( 'blend-to-purple' );
    },

    unblend: function () {

        TweenMax.killTweensOf( this.uniforms.blendProgress );
        TweenMax.to( this.uniforms.blendProgress, 4, {
            'value': 0.0,
            'ease': 'Cubic.easeInOut'
        });

        this.$root.removeClass( 'blend-to-purple' );
    },


    // Update
    // ------

    resize: function () {

        this.uniforms.windowRes.value = new THREE.Vector2( this.windowData.insetWidth/* * window.devicePixelRatio*/, this.windowData.insetHeight/* * window.devicePixelRatio*/ );
        this.uniforms.windowRatio.value = this.windowData.ratio;

        this.setShaderConfigUniforms();

        this.camera.aspect = this.windowData.ratio;
        this.camera.updateProjectionMatrix();

        // this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( this.windowData.insetWidth, this.windowData.insetHeight );
    },

    mouseMove: function () {

        this.uniforms.mousePos.value = new THREE.Vector2( this.mouseData.nX, this.mouseData.nY * -1 );
    },

    onAnimFrame: function () {

        this.render();
    },

    render: function () {

        var elapsedTime = ( this.windowData.time - this.startTime ) / 1000; // replaces THREE.Clock as there's an error on performance.now() in iOS8
        this.uniforms.time.value = 2700 + elapsedTime; // 15m + elapsed time

        var targetX = this.uniforms.mousePos.value.x;
        var targetY = this.uniforms.mousePos.value.y;
        var currentX = this.uniforms.mousePosSmooth.value.x;
        var currentY = this.uniforms.mousePosSmooth.value.y;

        var smoothing = 0.17;

        this.uniforms.mousePosSmooth.value = new THREE.Vector2(
            currentX + ( targetX - currentX ) * smoothing,
            currentY + ( targetY - currentY ) * smoothing
        );

        this.renderer.render( this.scene, this.camera );
    },


    // Routing
    // -------

    route: function () {

        var routeName = arguments[0][1];
        var routeOptions = arguments[0][2];

        switch( routeName ) {

            case 'info':
                this.routeInfo();
                break;

            case 'work':
            case 'project':
                this.routeWork();
                break;

            default:
                this.routeHome();
                break;

        }
    },

    routeHome: function () {

        this.unblend();
    },

    routeInfo: function () {

        this.blend();
    },

    routeWork: function () {

        this.unblend();
    }

});