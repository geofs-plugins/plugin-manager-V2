$(document).ready(function() {
    // AddPluginToUI();
});

$(document).on('click', '#addPluginButton', function() {
    var pluginUrl = $("#pluginUrlInput").val();
});

// Adds a plugin to the ui's plugin list
function AddPluginToUI(name, description, onClickHandler) {
    // addedHtml = '
    //                   <div class="panel panel-default">
    //                     <div class="panel-heading" role="tab" id="headingOne">
    //                       <h4 class="panel-title">
    //                         <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
    //                         ' + name + '
    //                         </a>
    //                       </h4>
    //                     </div>
    //                     <div id="collapseOne" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="headingOne">
    //                       <div class="panel-body">
    //                       ' + description + '
    //                       </div>
    //                     </div>
    //                   </div>
    //                 </div>
    // ';

    // $("#accordion").innerHTML += addedHtml;
}
