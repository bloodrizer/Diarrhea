// ==UserScript==
// @name         Diarrhea
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fixes diary.ru UI mess
// @author       You
// @include      http://*.diary.ru/*
// @run-at       document-start
// @resource bootstrap_paper  http://bootswatch.com/paper/bootstrap.min.css
// @resource medium  http://bloodrizer.ru/diarrhea/medium/css/medium-editor.min.css
// @resource medium_insert  http://bloodrizer.ru/diarrhea/medium/css/medium-editor-insert-plugin.min.css
// @require http://code.jquery.com/jquery-latest.js
// @require http://bloodrizer.ru/diarrhea/cloudinary/jquery.ui.widget.js

// @require http://bloodrizer.ru/diarrhea/cloudinary/jquery.fileupload.js
// @require http://bloodrizer.ru/diarrhea/cloudinary/jquery.iframe-transport.js
// @require http://bloodrizer.ru/diarrhea/cloudinary/jquery.cloudinary.js
// @require http://bloodrizer.ru/diarrhea/medium/js/medium-editor.js

// @require http://bloodrizer.ru/diarrhea/common/handlebars.runtime.js
// @require http://bloodrizer.ru/diarrhea/common/jquery-sortable.js

// @require http://bloodrizer.ru/diarrhea/medium/js/medium-editor-insert-plugin.js

// @grant        GM_getResourceText
// @grant        GM_addStyle

// ==/UserScript==

   //for now we will only temper with edit pages
   var query = window.location.search;
   if (query != "?newpost"){
       return;
   }


   var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
   var pageMeta = {};

   var _section_body;

   var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for (var i =0; i< mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i];

                //truncate main section of the page (with posts and shit)
                if (node.id == "wrapper"){
                   _section_body = node;
                }
                
                //extract author metadata
                if (node.id == "authorName"){
                    pageMeta.userUrl = $(node).attr("href");
                    pageMeta.userName = $("span", node).html();
                }

                //main menu
                if ($(node).hasClass("menu_block")){

                    var headerHTML =
                        '<div class="navbar navbar-default navbar-fixed-top">' +
                        '<div class="container">' +
                        '<div class="navbar-header">' +
                        '<a href="../" class="navbar-brand">DIARREAH</a>' +
                        '</div>' +
                        '<div class="navbar-collapse collapse" id="navbar-main">' +
                            '<ul class="nav navbar-nav">' +
                            '</ul>' +
                            '<ul class="nav navbar-nav navbar-right">' +

                                //TODO: actually mark this with ID, we will inject proper values later

                                '<li><a id="_diarr_user"></li>' +
                            '</ul>' +
                        '</div>' +
                     '</div>';

                    node.innerHTML = headerHTML;
                }
                //console.log("JQuery version:", $().jquery
                //diary uses jquery 2.2.1 which does not prevent 'Uncaught ReferenceError: $ is not defined' from appearing on a page.
            }
        }); //
   }); //observer

   observer.observe(document.documentElement,
      { childList: true, subtree: true}
   );

   GM_addStyle(
       GM_getResourceText("bootstrap_paper"));
   GM_addStyle(
       GM_getResourceText("medium"));
   GM_addStyle(
       GM_getResourceText("medium_insert"));

    /*
      intercepting individual styles is a messy and tedious task, it's better just to override some of diary design decisions in custom css
    */
   var journalOverrideCSS = 'menu_block { font-size: initial !important; } ' +
        'body {'+
        'font-family: "Roboto", "Helvetica Neue", Helvetica, Arial, sans-serif !important;'+
        'font-size: 14px !important;'+
        'line-height: 1.846 !important;' +
        'color: #666666 !important;'+
        'background-color: #ffffff !important;'+
        'background-image: none !important;' +
        '}' +

        '.bs-component { padding-top: 10px; }' +

       '#side { padding-top: 64px; }';

   GM_addStyle(journalOverrideCSS);

    //all changes should go in onLoad block after observer is disconnected to prevent additional mutation callbacks

   var editor = null;
   _publish = function(){
       console.log(editor,  editor.serialize());

       var html = "",
           elems = editor.serialize();

       for (var elem in elems){
           html += elems[elem].value;
       }
       console.log("result html:", html);
       $("#diarrhea-message").val(html);

       var userUrl = pageMeta.userUrl,
           _urlArr = userUrl.split("?");

       console.log("url", _urlArr);

       $("#diarrhea-journal_id").val(_urlArr[1]);
       $("#post_form").submit();

   };

   var uploadContext;

   $( document ).ready(function() {
        observer.disconnect();

        //populate all collected metadata
        var $user = $("#_diarr_user");

        $user.html(pageMeta.userName);
        $user.attr("href", pageMeta.userUrl);

        //-----------------------------------

        $('<form id="cloudinary-upload-form" style="display:none;"></form>')
			.appendTo($(_section_body));

        //_section_body.innerHTML = editorHTML;
        editor = new MediumEditor('.medium-editor');
           
        var $messageDiv = $('<div></div>').insertAfter($('#forTextarea'));

        var a = $('#codebuttons a')[9];
        $("<a><img src='http://static.diary.ru/img/image.gif'></a>")
            .click(function(){
               uploadContext.bind('cloudinarydone', function(e, data) {
                   insertCodeHTML( document.vbform.message, '<img src="' + data.result.url + '">');
                   $messageDiv.html('');
               });
            
               $messageDiv.html('<img src="https://upload.wikimedia.org/wikipedia/commons/d/de/Ajax-loader.gif">&nbsp;Uploading image...');
               $('#cloudinary-upload-form')[0].file.click();
            })
            .insertAfter(a);
        $(a).remove();


        $.cloudinary.config({ cloud_name: 'de1r9te3m', api_key: '634624764347287'});
        uploadContext = $('#cloudinary-upload-form').append($.cloudinary.unsigned_upload_tag("c6abfihq",
            { cloud_name: 'de1r9te3m' })
        );
   });
