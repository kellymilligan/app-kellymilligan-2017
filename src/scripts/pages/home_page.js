import { _, $, PageObject } from '../common';

export default Object.assign( Object.create( PageObject ), {


    twitterTouchStarted : false,
    twitterTouchTimer   : null,
    githubTouchStarted  : false,
    githubTouchTimer    : null,
    emailTouchStarted   : false,
    emailTouchTimer     : null,


    // Setup
    // -----

    setup: function () {

        _.bindAll( this,
            'onCharacterAnimComplete',
            'onTwitterTouchStart',
            'onTwitterTouchEnd',
            'onGithubTouchStart',
            'onGithubTouchEnd',
            'onEmailTouchStart',
            'onEmailTouchEnd'
        );

        this.ui = {

            name: this.node.find('.js-home__name'),
            intro: this.node.find('.js-home__intro'),
            social: this.node.find('.js-home__social'),
            socialTwitter: this.node.find('.js-home__social-twitter'),
            socialGithub: this.node.find('.js-home__social-github'),
            socialEmail: this.node.find('.js-home__social-email')
        };

        this.setupCharacters();

        this.ui.socialTwitter.on({
            'touchstart': this.onTwitterTouchStart,
            'touchend': this.onTwitterTouchEnd
        });

        this.ui.socialGithub.on({
            'touchstart': this.onGithubTouchStart,
            'touchend': this.onGithubTouchEnd
        });

        this.ui.socialEmail.on({
            'touchstart': this.onEmailTouchStart,
            'touchend': this.onEmailTouchEnd
        });

        // Temp
        this.show();
    },

    setupCharacters: function () {

        this.characters = [];

        this.characters = _.concat( this.characters, this.createCharacters( this.ui.name, this.appConfig.IS_MOBILE, this.characters.length ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.ui.intro, true, this.characters.length ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.ui.socialTwitter, true, this.characters.length ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.ui.socialGithub, true, this.characters.length ) );
        this.characters = _.concat( this.characters, this.createCharacters( this.ui.socialEmail, true, this.characters.length ) );

        this.characterCount = this.characters.length;
    },


    // Handlers
    // --------

    onTwitterTouchStart: function () {

        this.twitterTouchStarted = true;
        clearTimeout( this.twitterTouchTimer );
        this.twitterTouchTimer = _.delay( function () { this.twitterTouchStarted = false; }.bind(this), 600 );
    },

    onTwitterTouchEnd: function () {

        if ( this.twitterTouchStarted ) {
            this.ui.socialTwitter.click();
        }
    },

    onGithubTouchStart: function () {

        this.githubTouchStarted = true;
        clearTimeout( this.githubTouchTimer );
        this.githubTouchTimer = _.delay( function () { this.githubTouchStarted = false; }.bind(this), 600 );
    },

    onGithubTouchEnd: function () {

        if ( this.githubTouchStarted ) {
            this.ui.socialGithub.click();
        }
    },

    onEmailTouchStart: function () {

        this.emailTouchStarted = true;
        clearTimeout( this.emailTouchTimer );
        this.emailTouchTimer = _.delay( function () { this.emailTouchStarted = false; }.bind(this), 600 );
    },

    onEmailTouchEnd: function () {

        if ( this.emailTouchStarted ) {
            this.ui.socialEmail.click();
        }
    },


    // Routing
    // -------

    routeHome: function () {

        this.show();
    },

    routeInfo: function () {

        this.hide();
    },

    routeWork: function () {

        this.hide();
    }

});