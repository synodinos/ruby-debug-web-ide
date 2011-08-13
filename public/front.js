$(document).ready(function() {

  // Setup ace
  var editor = ace.edit("editor");
  var RubyMode = require("ace/mode/ruby").Mode;
  editor.getSession().setMode(new RubyMode());

  // Create main socket
  var socket = io.connect('http://127.0.0.1:8888');

  // On connect get list of available Ruby files
  socket.on('ruby_files', function (data) {
    console.log('Available scripts: ' + data + ' (sent over websocket)');
    $.each(data, function() {
      // Populate scripts list
      $('#rubyFiles').append("<option value='" + this + "'>" + this + "</option>");

      // When user makes a selection from the list
      $("#rubyFiles").change(function() {

        // Load the script the user chose in ace
        $.get('/ruby/' + $("#rubyFiles").val() + '', function(data) {
          editor.getSession().setValue(data);
        });

        // Enable the breakpoint input box
        $('#bline').removeAttr('disabled');

        // Clear breakpoint input box from a previous value (if there is one)
        $('#bline').val('');
      });
    });
  });

  // Server esponds with debugger data
  socket.on('frame', function (data) {
    // Remove previous results (if any)
    $('#results').remove();

    // Prepare the table to hold the results
    $('#results-container').append('<table id="results"></table>');
    $('#results').append('<thead><tr><th class="left">Name</th><th>Value</th><th>Type</th></tr></thead>');

    // Add one row for every variable
    _.each(data, function(varray) {
      console.log(varray);
      var vname = varray[0];
      var vvalue = (varray[1]) ? (varray[1]) : '-';
      var vtype  = (varray[2]) ? (varray[2]) : '-';
      $('#results').append('<tr><td class="left">' + vname + '</td><td>' + vvalue + '</td><td>' + vtype + '</td></tr>');
    })
  });

  // Launch a new debugger session on the server
  $('#spawn').click(function() {
    var script = $("#rubyFiles").val();
    var bline = $("#bline").val();
    editor.gotoLine(bline);
    socket.emit('spawn', {"script":script, "bline": bline});
  });
});