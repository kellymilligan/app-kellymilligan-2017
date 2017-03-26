import { _, $, PageObject } from '../common';

import GalleryItem from '../modules/gallery_item';

export default _.assign( _.create( PageObject ), {


    $first         : null,
    $second        : null,
    $third         : null,


    setup: function () {

        _.bindAll( this, 'onCharacterAnimComplete' );

        this.$first = this.node.find('.js-info__first');
        this.$second = this.node.find('.js-info__second');
        this.$third = this.node.find('.js-info__third');

        this.setupCharacters();
    },

    setupCharacters: function () {

        this.characters = [];

        this.characters = _.concat( this.characters, this.createCharacters( this.$first, true, this.characters.length, 0.7 ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.$second, true, this.characters.length, 0.7 ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.$third, true, this.characters.length, 0.7 ) );

        this.characterCount = this.characters.length;
    },


    // Routing
    // -------

    routeHome: function () {

        this.hide();
    },

    routeInfo: function () {

        this.show();
    },

    routeWork: function () {

        this.hide();
    }

});