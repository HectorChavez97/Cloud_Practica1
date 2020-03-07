$(document).ready(function() {
  $("#version").html("v0.14");
  
  $("#searchbutton").click( function (e) {
    displayModal();
  });
  
  $("#searchfield").keydown( function (e) {
    if(e.keyCode == 13) {
      displayModal();
    }	
  });
  
  function displayModal() {
    $("#myModal").modal('show');

    $("#status").html("Searching...");
    $("#dialogtitle").html("Search for: "+$("#searchfield").val());
    $("#previous").hide();
    $("#next").hide();
    $.getJSON('/search/' + $("#searchfield").val() , function(data) {
      renderQueryResults(data);
    });
  }
  
  images = [];
  currentIndex = 0;
  $("#next").click( function(e) {
    currentIndex++;
    var maxImagesToRender = images.length - (currentIndex*4);
    var i;
    for(i = 0; i < maxImagesToRender; i++) {
      $(`#img${i}`).attr("src", images[i + (currentIndex*4)]);
      $(`#img${i}`).show(); 
    }

    for(; i <= 3; i++) {
      $(`#img${i}`).hide();
    }
    
    $("#previous").show();
    if(maxImagesToRender < 4) $(this).hide();
  });
  
  $("#previous").click( function(e) {
    currentIndex--;
    for(var i = 0; i < 4; i++) {
      $(`#img${i}`).attr("src", images[i + (currentIndex*4)]);
      $(`#img${i}`).show();
    }
    $("#next").show();
    if(currentIndex == 0) $(this).hide();
  })

  function renderQueryResults(data) {
    if(data == undefined){
      $("#status").html("No images fund");
      
      var i
      for(i = 0; i < 4 ;i++){
        $(`#img${i}`).hide();
      }
    } 
    else {
      currentIndex = 0;
      $("#status").html("" + data.num_results+" result(s)");
      var img = (data.num_results >= 4)? 4: data.num_results;
      var i

      for(i = 0; i < img; i++) {
        $(`#img${i}`).attr('src', data.results[i]).width('230px').height('200px').show();
      }

      for(i; i < 4 ;i++){
        $(`#img${i}`).hide();
      }
      
      if(data.num_results > 4) $("#next").show();
    }
  }
 });