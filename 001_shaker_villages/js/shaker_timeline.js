const populationFile = 'population_data.csv';
const locationFile = 'timeline_village_locations.csv';
const eventsFile = 'shaker_events.csv';
const dateOffset = 1770;
const maxDate = 2000;
const timeInterval = 400;
const blockSize = 'medium';
let timer;

$(document).ready(function(){

  let populations;
  let villages;
  let dates;
  let files = 0;
  let mapSvg;
  let timelineSvg;
  let currDate;
  let playing = false;

  // sets up the timeline
  function timelineSetUp() {
    timelineSvg = document.getElementById('timeline');

    // clear the timeline if it is not empty
    timelineSvg.innerHTML = '';

    let height = 1; // height of timeline date in rems

    for (let date of dates) {
      // set up dates on left hand side
      let dateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      dateLabel.setAttributeNS(null, 'id', date.date + "Date");
      let classString = 'timeline-date';
      if (parseInt(date.date) % 10 != 0) { classString += " small";} // only decades are large
      if (parseInt(date.date) < dateOffset || parseInt(date.date) > maxDate) { classString += ' grayed-out';} // non accessible dates grayed out
      dateLabel.setAttributeNS(null, 'class', classString);
      dateLabel.setAttributeNS(null, 'x', remToPx(3.25, blockSize) + 'px');
      dateLabel.setAttributeNS(null, 'y', remToPx(height + 0.1, blockSize) + 'px');
      let textNode = document.createTextNode(date.date);
      dateLabel.appendChild(textNode);
      timelineSvg.appendChild(dateLabel);

      // set up timeline ticks
      let dateTick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      dateTick.setAttribute('id', date.date + "DateTick");
      classString = "timeline-date-tick";
      if (parseInt(date.date) < dateOffset || parseInt(date.date) > maxDate) {
        classString += ' grayed-out';
      }
      dateTick.setAttribute('class', classString);
      dateTick.setAttribute('x1', remToPx(3.75, blockSize) + 'px' );
      dateTick.setAttribute('y1', remToPx(height, blockSize) + 'px');
      dateTick.setAttribute('x2', remToPx(4.25, blockSize) + 'px');
      dateTick.setAttribute('y2', remToPx(height, blockSize) + 'px');
      timelineSvg.appendChild(dateTick);

      // set up timeline event text
      if (date.event) {
        // set up the classes
        classString = "timeline-event";
        if (parseInt(date.date) < dateOffset || parseInt(date.date) > maxDate) { classString += ' grayed-out'; }
        if (date.category == 'Context') { classString += ' context'; }

        // custom svg text wrap
        let charLimit = 38; // limit of displayable chars in timeline
        let lines = textWrap(date.event, charLimit);
        let lineNumber = 1;
        for (line of lines) {
          let dateEvent = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          dateEvent.setAttributeNS(null, 'id', date.date + "Event");
          dateEvent.setAttributeNS(null, 'class', classString);
          dateEvent.setAttributeNS(null, 'x', remToPx(4.75, blockSize) + 'px');
          dateEvent.setAttributeNS(null, 'y', remToPx(height + lineNumber - 1, blockSize) + 'px');
          textNode = document.createTextNode(line);
          dateEvent.appendChild(textNode);
          timelineSvg.appendChild(dateEvent);
          lineNumber++;
        }
      }

      height += 2;
    }

    $('#timeline').css('height', height + 'rem');
  }

  function setUp(csv, csvName) {
    if (csvName == populationFile) {
      populations = $.csv.toArrays(csv);
    } else if (csvName == locationFile) {
      villages = $.csv.toObjects(csv);
    } else if (csvName == eventsFile) {
      dates = $.csv.toObjects(csv);
    }

    files++;
    if (files == 6) { // if all files have been processed
      // set up cities
      mapSvg = document.getElementById('state-maps');

      for (let village of villages) { // place population dots behind on the DOM
        let populationDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        populationDot.setAttribute('class', 'cityPop');
        populationDot.setAttribute('id', village.id + 'Pop');
        populationDot.setAttribute('cx', village.x + '%');
        populationDot.setAttribute('cy', village.y + '%');
        populationDot.setAttribute('r', 0);
        mapSvg.appendChild(populationDot);
      }
      for (let village of villages) {
        let cityDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        cityDot.setAttribute('class', 'city');
        cityDot.setAttribute('id', village.id);
        cityDot.setAttribute('cx', village.x + '%');
        cityDot.setAttribute('cy', village.y + '%');
        cityDot.setAttribute('r', 0);
        mapSvg.appendChild(cityDot);
      };

      // set up timeline
      timelineSetUp();

      currDate = dateOffset;
      setDate(true);
    }
  }

  function setPop(villageId, population, animate) {
    let radius = pxToRem(Math.sqrt(population)) + 'rem';
    if (population == 0 && $('#' + villageId).css('r') != 0 ) {
      if (animate) {
        $('#' + villageId).animate({r: 0}, timeInterval);
      } else {
        $('#' + villageId).css('r', 0);
      }
    } else if (population != 0 & $('#' + villageId).css('r') != 0 ) {
      if (animate) {
        $('#' + villageId).animate({r: '0.25rem'}, timeInterval);
      } else {
        $('#' + villageId).css('r', '0.25rem');
      }
    }
    if (animate) {
      $('#' + villageId + 'Pop').animate({r: radius}, timeInterval);
      $('#' + villageId + 'Pop').css('r', radius);
    } else {
      $('#' + villageId + 'Pop').css('r', radius);
    }
  }

  function setTimeline(date) {
    $('.timeline-date').removeClass('selected');
    $('.timeline-date-tick').removeClass('selected');
    $('#' + date + 'Date').addClass('selected');
    $('#' + date + 'DateTick').addClass('selected');
  }

  function setDate(setScroll) {
    for (let id = 1; id <= villages.length; id++) {
      let index = currDate - dateOffset;
      setPop(id, populations[index][id], playing);
    }
    $('#date-ticker').html(currDate);
    setTimeline(currDate);
    if (setScroll) { // set scroll
      let pixelsScrolled = remToPx(2*(currDate - dateOffset), blockSize);
      $('#sidebar-timeline').animate({ scrollTop: pixelsScrolled}, timeInterval, 'linear');
    }
  }

  function setPlay() {
    playing = true;
    $('#sidebar-timeline').removeClass('scrollable');
    $('#play-button-container').children().hide();
    $('#pause-button').show();
    timer = setInterval(incrementDate, timeInterval);
  }

  function setPause() {
    clearInterval(timer);
    $('#sidebar-timeline').addClass('scrollable');
    $('#play-button-container').children().hide();
    $('#play-button').show();
    setTimeout(() => {playing = false;}, timeInterval); // prevents date from going backward due to scroll transition
  }

  function setReplay() {
    playing = false;
    clearInterval(timer);
    $('#sidebar-timeline').addClass('scrollable');
    $('#play-button-container').children().hide();
    $('#replay-button').show();
    currDate = dateOffset - 1;
  }

  // play/pause putton behavior
  $('.button-container').on('mousedown', 'svg', function(event) {
    if (playing) { // pause if playing
      setPause();
    } else { // play if paused
      setPlay();
    }
  });

  // increment date
  function incrementDate() {
    if (playing) {
      if (currDate == maxDate) {
        setReplay();
      } else {
        currDate++;
        setDate(true);
      }
    }
  }

  // when paused, scroll sets date
  $('#sidebar-timeline').scroll(function() {
    if (!playing) {
      let remsScrolled = pxToRem($('#sidebar-timeline').scrollTop(), blockSize);
      currDate = Math.round(remsScrolled/2 + dateOffset);
      if (currDate > maxDate) {
        currDate = maxDate;
      }
      setDate(false);
      if (currDate == maxDate) { // if date maxed out, button says replay
        setReplay();
      } else {
        $('#play-button-container').children().hide();
        $('#play-button').show();
      }
    }
  });

  // must reset timeline when window is resized because timeline units are in px
  $( window ).resize(function() {
    timelineSetUp();
  });

  // ajax requests for data setup

  $.ajax({
    type: 'GET',
    url: 'data/' + populationFile,
    dataType: 'text',
    success: function(data) {
      setUp(data, populationFile);
    }
  });

  $.ajax({
    type: 'GET',
    url: 'data/' + locationFile,
    dataType: 'text',
    success: function(data) {
      setUp(data, locationFile);
    }
  });

  $.ajax({
    type: 'GET',
    url: 'data/' + eventsFile,
    dataType: 'text',
    success: function(data) {
      setUp(data, eventsFile);
    }
  });
  
  $.ajax({
    type: 'GET',
    url: '../img/buttons/play-button.svg',
    dataType: 'text',
    success: function(data) {
      $('#play-button-container').append(data);
      setUp();
    }
  });
  
  $.ajax({
    type: 'GET',
    url: '../img/buttons/pause-button.svg',
    dataType: 'text',
    success: function(data) {
      $('#play-button-container').append(data);
      $('#pause-button').hide();
      setUp();
    }
  });
  
  $.ajax({
    type: 'GET',
    url: '../img/buttons/replay-button.svg',
    dataType: 'text',
    success: function(data) {
      $('#play-button-container').append(data);
      $('#replay-button').hide();
      setUp();
    }
  });
});
