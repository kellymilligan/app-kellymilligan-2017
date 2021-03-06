
import { _, $ } from './common';

import Navigo from 'navigo';

import Background from './modules/background';
import Nav from './modules/nav';

import HomePage from './pages/home_page';
import InfoPage from './pages/info_page';
import WorkPage from './pages/work_page';

import clamp from './utils/math/clamp';
import detect_ie from './utils/dom/detect_ie';

export default function () {


    const BASE_WIDTH = 1440;
    const BASE_WIDTH_MOBILE = 599;
    const MIN_SCALE = 0.4;
    const MAX_SCALE = 1.2;

    const IE = detect_ie();

    let appConfig, windowData, mouseData, ui;

    let router = null;

    let background = null;
    let nav = null;
    let pages = null;

    let trickleList = [];
    let trickleLength = 0;

    start();


    // Setup
    // -----

    function start() {

        ui = {

            window   : $(window),
            document : $(document),
            html     : $(document.documentElement),
            root     : $('.js-root')
        };

        appConfig = {

            IS_MOBILE: window.innerWidth <= BASE_WIDTH_MOBILE,
            IS_IOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
            IS_SAFARI: navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1,
            IS_IE: IE.flag,
            is_IE_EDGE: IE.flag && IE.version === "Edge",
            is_IE_11: IE.flag && IE.version === "11",
            IS_IE10_OR_BELOW: IE.flag && IE.version === "<=10"
        };

        if ( appConfig.IS_IE ) { ui.html.addClass('is-ie'); }
        if ( appConfig.IS_IE_EDGE ) { ui.html.addClass('is-ie-edge'); }
        if ( appConfig.IS_IE_11 ) { ui.html.addClass('is-ie-11'); }
        if ( appConfig.IS_IE10_OR_BELOW ) { ui.html.addClass('is-ie-10-or-below'); $('.browsehappy')[0].style.display = 'block'; }
        if ( appConfig.IS_SAFARI ) { ui.html.addClass('is-safari'); }
        if ( appConfig.IS_IOS ) { ui.html.addClass('is-ios'); }

        windowData = {

            width: 0,
            height: 0,
            ratio: 0,
            scale: 0,
            FRAME_WIDTH: 7, // as per value in SCSS variables
            insetWidth: 0,
            insetHeight: 0,
            time: 0
        };

        mouseData = {

            x: 0,
            y: 0,
            nX: 0,
            nY: 0
        };

        createBackground();
        createNav();
        createPages();

        trickleLength = trickleList.length;

        setupRouting();

        addEvents();
        onResize();

        // Remove loader
        $('#loader').addClass('hide');
        _.delay( () => $('#loader').remove(), 800 );

        // Start anim frame
        _.defer( () => window.requestAnimationFrame( onAnimFrame ) );
    }

    function setupRouting() {

        // router = new Navigo( null, false );
        router = new Navigo( null, true, '#!' );

        router.on({

            // Produciton routes
            '/info': (p) => route( 'info', p ),
            '/work': (p) => route( 'work', p ),
            '*':     (p) => route( 'home', p )

            // Dev - force wildcard on specific page
            // ,'*': function (p) { this.route( 'work', p ); }.bind( this ),
        });

        nav.addEventListener( 'pageNavigate', onPageNavigate );

        // Go directly to route if supplied
        router.resolve();
    }

    function createBackground() {

        background = _.create( Background );

        background.init({
            'appConfig': appConfig,
            'windowData': windowData,
            'mouseData': mouseData,
            'node': ui.root.find( '.js-background' ),
            'root': ui.root
        });

        trickleList.push( background );
    }

    function createNav() {

        nav = _.create( Nav );

        nav.init({
            'appConfig': appConfig,
            'windowData': windowData,
            'mouseData': mouseData,
            'node': ui.root.find( '.js-page-nav' )
        });

        trickleList.push( nav );
    }

    function createPages() {

        pages = {
            'home': _.create( HomePage ),
            'info': _.create( InfoPage ),
            'work': _.create( WorkPage )
        };

        pages.home.init({ 'node': ui.root.find('.js-home'), 'appConfig': appConfig, 'windowData': windowData, 'mouseData': mouseData });
        pages.info.init({ 'node': ui.root.find('.js-info'), 'appConfig': appConfig, 'windowData': windowData, 'mouseData': mouseData });
        pages.work.init({
            'node': ui.root.find('.js-work'),
            'appConfig': appConfig,
            'windowData': windowData,
            'mouseData': mouseData,
            'navRef': nav
        });

        _.each( pages, (page) => trickleList.push( page ) );
    }

    function addEvents() {

        ui.window.on( 'load', onLoad );
        ui.window.on( 'resize', onResize );

        ui.document.on( 'mousemove', onMouseMove );
        ui.document.on( 'touchstart', onTouchStart );
        ui.document.on( 'touchmove', onTouchMove );
    }


    // Handlers
    // --------

    function onLoad() {

        nav.show();
    }

    function onResize() {

        windowData.width = ui.window.width();
        windowData.height = ui.window.height();
        windowData.ratio = windowData.width / windowData.height;

        windowData.insetWidth = windowData.width - ( windowData.FRAME_WIDTH * 2 );
        windowData.insetHeight = windowData.height - ( windowData.FRAME_WIDTH * 2 );

        appConfig.IS_MOBILE = windowData.width <= BASE_WIDTH_MOBILE;
        if ( appConfig.IS_MOBILE ) { ui.html.addClass('is-mobile'); } else { ui.html.removeClass('is-mobile'); }

        var baseWidth = appConfig.IS_MOBILE ? BASE_WIDTH_MOBILE : BASE_WIDTH;
        windowData.scale = clamp( windowData.width / baseWidth, MIN_SCALE, MAX_SCALE );

        ui.html[0].style.fontSize = 10 * windowData.scale + 'px';

        trickle( 'resize' );
    }

    function onMouseMove(e) {

        mouseData.x = e.clientX;
        mouseData.y = e.clientY;

        mouseData.nX = ( mouseData.x / windowData.width ) * 2 - 1;
        mouseData.nY = ( mouseData.y / windowData.height ) * 2 - 1;

        trickle( 'mouseMove' );
    }

    function onTouchStart(e) {

        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;

        onMouseMove( e );
    }

    function onTouchMove(e) {

        e.clientX = e.touches[0].clientX;
        e.clientY = e.touches[0].clientY;

        onMouseMove( e );
    }

    function onAnimFrame(t) {

        windowData.time = Date.now();

        trickle( 'animFrame' );

        window.requestAnimationFrame( onAnimFrame );
    }


    // Routing
    // -------

    function onPageNavigate(e) {

        switch( e.targetPage ) {

            case 'HOME':
                router.navigate('/');
                break;

            case 'INFO':
                router.navigate('/info');
                break;

            case 'WORK':
                router.navigate('/work');
                break;

            default:
                router.navigate('/');
                break;
        }
    }

    function route(routeName, routeOptions) {

        // console.log( 'route: ', routeName, routeOptions );

        trickle( 'route', routeName, routeOptions );
    }


    // Trickle
    // -------

    function trickle(name) {

        for ( var i = 0; i < trickleLength; i++ ) {

            trickleList[ i ][ name ]( arguments );
        }
    }

}