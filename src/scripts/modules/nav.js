import { _, $, BaseObject } from '../common';

import EventDispatcher from '../lib/event-dispatcher';
import wrapCharacters from '../utils/dom/wrap_characters';
import Character from '../modules/character';

export default _.assign( _.create( BaseObject ), EventDispatcher, {


    isShown        : false,

    $home          : null,
    $info          : null,
    $work          : null,

    characters     : null,
    characterCount : 0,

    selected       : null,

    hideCallback   : null,

    prevRouteName  : null,


    // Setup
    // -----

    setup: function () {

        _.bindAll( this, 'show', 'onClickHome', 'onClickInfo', 'onClickWork', 'onCharacterAnimComplete' );

        this.$home = this.node.find('.js-page-nav__home');
        this.$info = this.node.find('.js-page-nav__info');
        this.$work = this.node.find('.js-page-nav__work');

        this.setupCharacters();

        this.$home.on( 'click', this.onClickHome );
        this.$info.on( 'click', this.onClickInfo );
        this.$work.on( 'click', this.onClickWork );
    },

    setupCharacters: function () {

        this.characters = [];

        this.characters = _.concat( this.characters, this.createCharacters( this.$home, true, this.characters.length, 1.5 ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.$info, true, this.characters.length, 1.5 ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.$work, true, this.characters.length, 1.5 ) );

        this.characterCount = this.characters.length;
    },

    createCharacters: function ($element, asWords, startingIndex, intensity) {

        var spans = wrapCharacters( $element, asWords );
        var characters = [];

        for ( var i = 0; i < spans.length; i++ ) {

            var character = this.createChild( Character, spans[i], { 'index': startingIndex + i, 'localIndex': i, 'intensity': intensity, 'isPageNav': true } );

            characters.push( character );
        }

        return characters;
    },


    // State
    // -----

    show: function () {

        if ( this.isShown ) { return; }
        this.isShown = true;

        this.node[0].style.display = 'block';

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[i].activate( 0.8, 0 );
        }
    },

    hide: function (callback) {

        if ( !this.isShown ) { return; }
        this.isShown = false;

        if ( !this.characterCount ) { this.hideComplete(); }

        this.hideCallback = callback || null;

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[i].addEventListener( 'characterAnimComplete', this.onCharacterAnimComplete );
            this.characters[i].deactivate( 0.8 );
        }
    },

    hideComplete: function () {

        this.node[0].style.display = 'none';

        if ( this.hideCallback ) { this.hideCallback(); }
    },

    hideCancel: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[i].removeEventListener( 'characterAnimComplete', this.onCharacterAnimComplete );
        }

        if ( this.hideCallback ) { this.hideCallback(); }
    },

    // @TODO - This is flawed, the last character doesn't necessarily have the longest hide duration
    //         Instead use _.after to only fire once total characterCount calls come back?
    onCharacterAnimComplete: function (e) {

        this.characters[ e.characterIndex ].removeEventListener( 'characterAnimComplete', this.onCharacterAnimComplete );

        if ( e.characterIndex === this.characterCount - 1 ) {

            this.hideComplete();
        }
    },

    blur: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].blur();
        }
    },

    focus: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].focus();
        }
    },


    // Update
    // ------

    resize: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[i].resize();
        }
    },

    mouseMove: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[i].mouseMove();
        }
    },

    onAnimFrame: function () {

        for ( var i = 0; i < this.characterCount; i++ ) {

            this.characters[i].animFrame();
        }
    },


    // Handlers
    // --------

    onClickHome: function () {

        this.dispatchEvent( { type: 'pageNavigate', targetPage: 'HOME' } );
    },

    onClickInfo: function () {

        this.dispatchEvent( { type: 'pageNavigate', targetPage: 'INFO' } );
    },

    onClickWork: function () {

        this.dispatchEvent( { type: 'pageNavigate', targetPage: 'WORK' } );
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

        this.prevRouteName = routeName;
    },

    select: function( $item ) {

        this.$home.removeClass( 'is-selected' );
        this.$info.removeClass( 'is-selected' );
        this.$work.removeClass( 'is-selected' );

        $item.addClass( 'is-selected' );
    },

    routeHome: function () {

        this.select( this.$home );
    },

    routeInfo: function () {

        this.select( this.$info );
    },

    routeWork: function () {

        this.select( this.$work );
    }

});