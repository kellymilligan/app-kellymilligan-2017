import { _, $, BaseObject } from '../common';

import wrapCharacters from '../utils/dom/wrap_characters';
import Character from '../modules/character';


export default Object.assign( Object.create( BaseObject ), {


    isShown        : false,

    characters     : null,
    characterCount : 0,

    ui             : null,


    createCharacters: function ($element, asWords, startingIndex, intensity) {

        var spans = wrapCharacters( $element, asWords );
        var characters = [];

        for ( var i = 0; i < spans.length; i++ ) {

            var character = this.createChild( Character, spans[ i ], { 'index': startingIndex + i, 'localIndex': i, 'intensity': intensity } );

            characters.push( character );
        }

        return characters;
    },


    // State
    // -----

    show: function () {

        if ( this.isShown ) { return; }
        this.isShown = true;

        this.hideCancel();

        this.node[0].style.display = 'block';

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].activate();
        }
    },

    hide: function () {

        if ( !this.isShown ) { return; }
        this.isShown = false;

        if ( !this.characterCount ) { this.hideComplete(); }

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].addEventListener( 'characterAnimComplete', this.onCharacterAnimComplete );
            this.characters[ i ].deactivate();
        }
    },

    hideComplete: function () {

        this.node[ 0 ].style.display = 'none';
    },

    hideCancel: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].removeEventListener( 'characterAnimComplete', this.onCharacterAnimComplete );
        }
    },

    // @TODO - This is flawed, the last character doesn't necessarily have the longest hide duration
    onCharacterAnimComplete: function (e) {

        this.characters[ e.characterIndex ].removeEventListener( 'characterAnimComplete', this.onCharacterAnimComplete );

        if ( e.characterIndex === this.characterCount - 1 ) {

            this.hideComplete();
        }
    },


    // Update
    // ------

    resize: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].resize();
        }
    },

    mouseMove: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].mouseMove();
        }
    },

    onAnimFrame: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {
            
            this.characters[ i ].animFrame( this.time );
        }
    },


    // Routing
    // -------

    route: function () {

        var routeName = arguments[ 0 ][ 1 ];
        var routeOptions = arguments[ 0 ][ 2 ];

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
    }

});