(function($) {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  $("#sidebarToggle").on('click',function(e) {
    e.preventDefault();
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
  });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
    if ($(window).width() > 768) {
      var e0 = e.originalEvent,
        delta = e0.wheelDelta || -e0.detail;
      this.scrollTop += (delta < 0 ? 1 : -1) * 30;
      e.preventDefault();
    }
  });

  // Scroll to top button appear
  $(document).on('scroll',function() {
    var scrollDistance = $(this).scrollTop();
    if (scrollDistance > 100) {
      $('.scroll-to-top').fadeIn();
    } else {
      $('.scroll-to-top').fadeOut();
    }
  });

  // Smooth scrolling using jQuery easing
  $(document).on('click', 'a.scroll-to-top', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
      scrollTop: ($($anchor.attr('href')).offset().top)
    }, 1000, 'easeInOutExpo');
    event.preventDefault();
  });

})(jQuery); // End of use strict



$( document ).ready(function() {

  var timezone = jstz.determine();
  var tzname = timezone.name();

  Cookies.set('tzname_from_user', tzname);

  // starting timers with different startimes
  $('.time_diff').each(function () {
    var time_passed = $(this).text();
    console.log(time_passed);
    time_passed = get_time_seconds(time_passed); // in seconds
    var timer_id = $(this).parent("div").find('div[id*="timer_"]').attr('id');
    start_timer(timer_id, time_passed);
  })

  var csrf_token = $("#csrf_token_div").text().trim();


  if($("#doctor_id_div").length != 0) {
    // there are appointments today, therefore we need to poll
    // for updates to check when patients check in
    console.log($('doctor_id_div').text());
    var doctor_id = $('#doctor_id_div').text().trim();
    sync_updates(csrf_token);
  }


});

// get time passed in seconds from text in the format 'xx hours, xx minutes'
function get_time_seconds(time_passed) {
  console.log(time_passed);
  var seconds_passed = 0;
  var hours_index = time_passed.indexOf("hour");
  var minutes_index = time_passed.indexOf("minute");
  if (hours_index >= 0) {

    var additions = parseInt(time_passed[hours_index-3] + time_passed[hours_index-2]) * 60 * 60;

    if (isNaN(additions)){
      seconds_passed += parseInt(time_passed[hours_index-2]) * 60 * 60;
    }
    else{
      seconds_passed += additions;
    }
  }
  if (minutes_index >= 0) {

    var additions = parseInt(time_passed[minutes_index-3] + time_passed[minutes_index-2]) * 60;

    if (isNaN(additions)){
      seconds_passed += parseInt(time_passed[minutes_index-2]) * 60;
    }
    else {
      seconds_passed += additions
    }

  }
  return seconds_passed;
}


function start_timer(timer_id, time_passed) {
  $('#'+timer_id).timer({action:"start", seconds: time_passed});
}


function call_patient(appointment_id, csrf_token) {
  // show 'seeing patient', remove timer, show Done button to complete appointment
  $('#timer_'+appointment_id).remove();
  $('#status_'+appointment_id).removeClass('alert-success').addClass('alert-info');
  $('#status_'+appointment_id).html('<strong>In Progress<strong/>');
  $('#btn_'+appointment_id).html('Done');
  $('#btn_'+appointment_id).removeClass('btn-success').addClass('btn-info');
  $('#btn_'+appointment_id).attr("onclick","appointment_completed(" + appointment_id + ", '"+ csrf_token +"')");

  var current_date_time = new Date($.now());
  current_date_time = current_date_time.toUTCString()
  console.log(current_date_time);
  // add time_waited duration to appointment_obj and save in db

  $.post('/call_patient/',
    {
      csrfmiddlewaretoken: csrf_token,
      appointment_id: appointment_id,
      current_date_time: current_date_time

    },
    function(data){
      // data = $.parseJSON(data);
      if (data['status'] == 'success'){
        $("#avg_wait_time_div").html("<h4> " + data['avg_wait_time'] + " </h4>");
      }
      else{
        console.log(data['message']);
      }
    }
  );


}


function appointment_completed(appointment_id, csrf_token) {
  // update status of appointment to 'complete' in db and drchrono api

  $('#status_'+appointment_id).removeClass('alert-info').addClass('alert-warning');
  $('#status_'+appointment_id).html('<strong>Completed<strong/>');
  $('#btn_'+appointment_id).remove();

  $.post('/appointment_completed/',
    {
      csrfmiddlewaretoken: csrf_token,
      appointment_id: appointment_id

    },
    function(data){
      // data = $.parseJSON(data);
      console.log(data);
    }
  );

}

function sync_updates(csrf_token) {
  setInterval(function() {
    $.post('/sync_updates/',
      {
        csrfmiddlewaretoken: csrf_token,

      },
      function(data){
        if (data['status'] == 'success'){

          // loop through updates and change dom accordingly
          $.each( data['updates'], function( index, value ){
            $('#' + value + '_arrived').html(
                "<div class=\"col-md-3\">\
                <div id='status_" + value + "' class=\"alert alert-success\" style=\"text-align: center\">\
                    <strong>Patient Arrived!</strong>\
                  <div id=\"timer_" + value + "\" class=\"badge\">00:00</div>\
                </div>\
              </div>\
              <div class=\"col-md-2\">\
                <button id=\"btn_" + value + "\" type=\"button\" class=\"btn btn-success\" onclick=\"call_patient('"+ value +"', '" + csrf_token + "')\">See Patient</button>\
              </div>"
              );
            // $('#' + value + '_arrived').find();
            $('#timer_'+value).timer({action:"start", seconds: 0});
          });

        }
        else{
          console.log(data['message'])
        }


      }
    );

  }, 1500);

}




$( document ).ready(function() {
    setInterval(drawClock, 1000);
});
  
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var radius = canvas.height / 2;
ctx.translate(radius, radius);
radius = radius * 0.90
setInterval(drawClock, 1000);



function drawClock() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  drawTime(ctx, radius);
}

function drawFace(ctx, radius) {
  var grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2*Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
  grad.addColorStop(0, '#333');
  grad.addColorStop(0.5, 'white');
  grad.addColorStop(1, '#333');
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius*0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
  ctx.fillStyle = '#333';
  ctx.fill();
}

function drawNumbers(ctx, radius) {
  var ang;
  var num;
  ctx.font = radius*0.15 + "px arial";
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  for(num = 1; num < 13; num++){
    ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    ctx.rotate(-ang);
    ctx.fillText(num.toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }
}

function drawTime(ctx, radius){
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    //hour
    hour=hour%12;
    hour=(hour*Math.PI/6)+
    (minute*Math.PI/(6*60))+
    (second*Math.PI/(360*60));
    drawHand(ctx, hour, radius*0.5, radius*0.07);
    //minute
    minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
    drawHand(ctx, minute, radius*0.8, radius*0.07);
    // second
    second=(second*Math.PI/30);
    drawHand(ctx, second, radius*0.9, radius*0.02);
}

function drawHand(ctx, pos, length, width) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
}

