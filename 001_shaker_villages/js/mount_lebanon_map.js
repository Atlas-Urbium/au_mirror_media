$(document).ready(function(){

  function getXCoordinate(x) {
    let width = $(window).width();
    let offset = 0;
    if (width > 1280) {
      offset = (width - remToPx(89.5))/2;
    }
    return x - offset;
  }

  $( '#svg-container' ).on( "mouseenter", function( event ) {
    $( "#flashlight" ).attr("cx", getXCoordinate(event.pageX));
    $( "#flashlight" ).attr("cy", event.pageY);
    $( "#flashlight" ).stop();
    $( "#flashlight" ).animate({r: '11.75rem'});
  });

  $( '#svg-container' ).on( "mouseleave", function( event ) {
    $( "#flashlight" ).attr("cx", getXCoordinate(event.pageX));
    $( "#flashlight" ).attr("cy", event.pageY);
    $( "#flashlight" ).stop();
    $( "#flashlight" ).animate({r: '0'});
  });

  $( '#svg-container' ).on( "mousemove", function( event ) {
    $( "#flashlight" ).attr("cx", getXCoordinate(event.pageX));
    $( "#flashlight" ).attr("cy", event.pageY);
  });

  $( '#svg-container' ).on( "mousedown", function( event ) {
    if ($( "#darkness" ).attr("fill") == 'black') {
      $( "#darkness" ).attr("fill", 'white');
      $( '.underground-text' ).removeClass('hidden');
      $( '.aboveground-text' ).addClass('hidden');
    } else {
      $( "#darkness" ).attr("fill", 'black');
      $( '.aboveground-text' ).removeClass('hidden');
      $( '.underground-text' ).addClass('hidden');
      $
    }
  });
  
  $( '#svg-container' ).on( "touchstart", function( event ) {
    $('#flashlight').remove();
  });
});
