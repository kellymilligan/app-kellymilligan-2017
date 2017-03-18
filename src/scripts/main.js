import { _, $ } from './common';
import HomePage from './pages/home_page';

export default function () {


    const BASE_WIDTH = 1440;

    let pages = null;
    let ui = null;
    let windowData = null;
    let mouseData = null;

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

        windowData = {

            width: 0,
            height: 0,
            ratio: 0,
            scale: 0
        };

        mouseData = {

            x: 0,
            y: 0,
            nX: 0,
            nY: 0
        };

        createPages();
        addEvents();
        onResize();

        // Start anim frame
        _.defer( function () { window.requestAnimationFrame( onAnimFrame ); } );
    }

    function createPages() {

        pages = {

            home: Object.create( HomePage )
        };

        pages.home.init({

            'windowData': windowData,
            'mouseData': mouseData,
            'node': ui.root.find( '.js-home' )
        });
    }

    function addEvents() {

        ui.window.on( 'resize', onResize );
        ui.document.on( 'mousemove', onMouseMove );
    }


    // Handlers
    // --------

    function onResize() {

        windowData.width = ui.window.width();
        windowData.height = ui.window.height();
        windowData.ratio = windowData.width / windowData.height;
        windowData.scale = windowData.width / BASE_WIDTH;

        ui.html[0].style.fontSize = 10 * windowData.scale + 'px';

        pages.home.resize();
    }

    function onMouseMove(e) {

        mouseData.x = e.clientX;
        mouseData.y = e.clientY;

        mouseData.nX = ( mouseData.x / windowData.width ) * 2 - 1;
        mouseData.nY = ( mouseData.y / windowData.height ) * 2 - 1;

        pages.home.mouseMove();
    }

    function onAnimFrame(t) {

        const time = Date.now();

        pages.home.animFrame( time );

        window.requestAnimationFrame( onAnimFrame );
    }

}