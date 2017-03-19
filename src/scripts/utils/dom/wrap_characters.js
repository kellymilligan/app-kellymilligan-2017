/*
    Wrap individual letters and words in a span structure
    ---
    Very useful for animating individual letters or words
    while maintaining CSS based layout. Wraps whole words
    to ensure they don't get split at line-end, and wraps
    words or individual characters in a span structure.

*/

import $ from 'webpack-zepto';

export default function (
    
    $element, 
    wrapAsWords = false
    
) {

    let words = $element.text().split( ' ' ) ;
    let spans = [];

    $element.empty();

    $.each( words, function(i, word) {

        let $word = $( '<span class="word">' + word + '</span>' );
        let characters = $word.text().split( '' );

        $word.empty();

        if ( wrapAsWords ) {

            let $textSpan = $( document.createElement('span') );
            let $animSpan = $( document.createElement('span') );

            $textSpan.addClass( 'char-text' );
            $textSpan.append( word );

            $animSpan.addClass( 'char-anim' );
            $animSpan.attr( 'data-char', word ); // Add to pseudo element's content property

            $word.append( $textSpan );
            $word.append( $animSpan );

            $word.addClass( 'char' );

            spans.push( $word );
        }
        else {

            $.each( characters, function(i, c) {

                let $outerSpan = $( document.createElement('span') );
                let $textSpan = $( document.createElement('span') );
                let $animSpan = $( document.createElement('span') );

                $textSpan.addClass( 'char-text' );
                $textSpan.append( c );

                $animSpan.addClass( 'char-anim' );
                $animSpan.attr( 'data-char', c ); // Add to pseudo element's content property

                $outerSpan.append( $textSpan );
                $outerSpan.append( $animSpan );

                $outerSpan.addClass( 'char' );

                $word.append( $outerSpan );

                spans.push( $outerSpan );
            });
        }

        $element.append( $word );
        $element.append( ' ' ); // Add a white space between each word

    });

    return spans;
};