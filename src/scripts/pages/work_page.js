import { _, $, PageObject } from '../common';

import GalleryItem from '../modules/gallery_item';

export default Object.assign( Object.create( PageObject ), {

    $projects     : null,
    $projectLinks : null,

    $gallery      : null,
    $galleryItems : null,

    $minimiseHit  : null,

    pageNavRef    : null,

    items         : null,
    itemCount     : 0,

    hasMaximised  : false,

    selectedId    : null,


    setup: function (options) {

        _.bindAll( this,
            'onAnimFrame',
            'onCharacterAnimComplete',
            'onProjectLinkClick',
            'onMinimiseHitClick',
            // 'onGalleryItemMaximise',
            // 'onGalleryItemMinimise',
            'onGalleryItemClick',
            'onGalleryItemMinimiseComplete'
        );

        this.pageNavRef = options.pageNav;

        this.$projects = this.node.find( '.js-work__projects' );
        this.$projectLinks = this.$projects.children( 'a' );

        this.$gallery = this.node.find( '.js-work__gallery' );
        this.$galleryItems = this.$gallery.find( '.js-gallery__item' );

        this.$minimiseHit = $( '.js-work__minimise-hit' );

        this.setupCharacters();
        this.setupGallery();

        this.addEvents();
    },

    setupCharacters: function () {

        this.characters = [];

        _.each( this.$projectLinks, function (element, index) {

            this.characters = _.concat( this.characters, this.createCharacters( this.$projectLinks.eq( index ), true, this.characters.length ) );

        }.bind( this ) );

        this.characterCount = this.characters.length;
    },

    setupGallery: function () {

        this.items = [];

        _.each( this.$galleryItems, function (element, index) {

            let item = this.createChild( GalleryItem, this.$galleryItems.eq( index ), { 'index': index } );

            // item.addEventListener( 'galleryItem:maximise', this.onGalleryItemMaximise );
            // item.addEventListener( 'galleryItem:minimise', this.onGalleryItemMinimise );
            item.addEventListener( 'galleryItem:click', this.onGalleryItemClick );
            item.addEventListener( 'galleryItem:minimiseComplete', this.onGalleryItemMinimiseComplete );

            this.items.push( item );

        }.bind( this ) );

        this.itemCount = this.items.length;
    },

    hideGalleryItems: function () {

        for ( let i = 0; i < this.itemCount; i++ ) {

            this.items[i].minimise();
            this.items[i].deactivate();
        }

        this.$gallery.removeClass( 'has-maximised' );
        this.$projectLinks.removeClass( 'is-selected' );
        this.$minimiseHit[0].style.display = 'none';
        this.focus();
        this.selectedId = null;
    },

    addEvents: function () {

        _.each( this.$projectLinks, function ( link ) { $(link).on( 'click', this.onProjectLinkClick ); }.bind( this ));

        this.$minimiseHit.on( 'click', this.onMinimiseHitClick );
    },


    // Update
    // ------

    resize: function () {

        PageObject.resize.call( this );

        for ( let i = 0; i < this.itemCount; i++ ) {

            this.items[i].resize();
        }
    },

    mouseMove: function () {

        PageObject.mouseMove.call( this );

        for ( let i = 0; i < this.itemCount; i++ ) {

            this.items[i].mouseMove();
        }
    },

    onAnimFrame: function () {

        PageObject.onAnimFrame.call( this );

        for ( let i = 0; i < this.itemCount; i++ ) {

            this.items[i].animFrame( this.time );
        }
    },


    // State
    // -----

    blur: function (exclusion) {

        _.each( this.items, function (item) {

            if ( item !== exclusion ) {

                item.blur();
            }
        } );

        for ( let i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].blur();
        }

        this.pageNavRef.blur();
    },

    focus: function (exclusion) {

        _.each( this.items, function (item) { item.focus(); } );

        for ( let i = 0; i < this.characterCount; i++ ) {

            this.characters[ i ].focus();
        }

        this.pageNavRef.focus();
    },


    // Handlers
    // --------

    onMinimiseHitClick: function () {

        // Minimise the active item
        _.each( this.items, function (item) { if ( item.isMaximised ) { item.minimise(); } } );

        // Hide the hit area
        this.$minimiseHit[0].style.display = 'none';
        this.focus();
    },

    onProjectLinkClick: function (e) {

        e.preventDefault();

        let $clicked = $( e.currentTarget );
        let id = $clicked.data('id');

        // let delay = !this.selectedId ? 0 : 1;

        // Activate instantly on first selection
        if ( id === this.selectedId ) { return; }

        // Deselect others
        this.$projectLinks.removeClass( 'is-selected' );

        // Select target
        $clicked.addClass('is-selected');

        // Deactivate then update
        _.each( this.items, function (item) {

            if ( this.selectedId ) {

                item.deactivate( 0, function () { item.update( id ); });
            }
            else {

                item.update( id );
            }
        }.bind( this ) );

        this.selectedId = id;
    },

    onGalleryItemClick: function (e) {

        let item = this.items[ e.index ];

        for ( let i = 0; i < this.itemCount; i++ ) {

            if ( i === e.index ) { continue; }
            if ( this.items[i].isMaximised ) { this.items[i].minimise(); }
        }

        if ( item.isMaximised ) {

            item.minimise();
        }
        else {

            item.maximise();
            this.$gallery.addClass( 'has-maximised' );
            this.$minimiseHit[0].style.display = 'block';
            this.blur( item );
        }
    },

    onGalleryItemMinimiseComplete: function () {

        let maximisedCount = 0;

        for ( let i = 0; i < this.itemCount; i++ ) {

            if ( this.items[i].isMaximised ) {

                maximisedCount += 1;
            }
        }

        if ( maximisedCount === 0 ) {

            this.$gallery.removeClass( 'has-maximised' );
        }
    },


    // Routing
    // -------

    routeHome: function () {

        this.hide();
        this.hideGalleryItems();
    },

    routeInfo: function () {

        this.hide();
        this.hideGalleryItems();
    },

    routeWork: function () {

        this.show();
    }

});