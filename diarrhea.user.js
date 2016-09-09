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
// @require http://bloodrizer.ru/diarrhea/medium/js/medium-editor.js

// @require http://bloodrizer.ru/diarrhea/common/handlebars.runtime.js
// @require http://bloodrizer.ru/diarrhea/common/jquery-sortable.js

// @require http://bloodrizer.ru/diarrhea/medium/js/medium-editor-insert-plugin.js

// @grant        GM_getResourceText
// @grant        GM_addStyle

// ==/UserScript==


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
                   node.innerHTML = "";
                }

                //truncate sidebar
                if (node.id == "side"){
                    node.innerHTML = "";
                }

                //extract author metadata
                if (node.id == "authorName"){
                    pageMeta.userUrl = $(node).attr("href");
                    pageMeta.userName = $("span", node).html();
                    console.log("PAGE META:", pageMeta);
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
        'font-size: initial !important;'+
        'line-height: 1.846 !important;' +
        'color: #666666 !important;'+
        'background-color: #ffffff !important;'+
        'background-image: none !important;' +
        '}';
   GM_addStyle(journalOverrideCSS);

    //all changes should go in onLoad block after observer is disconnected to prevent additional mutation callbacks

   var editor = null;

   $( document ).ready(function() {
        observer.disconnect();

        //populate all collected metadata
        var $user = $("#_diarr_user");

        $user.html(pageMeta.userName);
        $user.attr("href", pageMeta.userUrl);

        //-----------------------------------
        var query = window.location.search;
        if (query == "?newpost"){

           var editorHTML =
               '<div class="container"><div class="page-header">Новая запись</div><div class="bs-docs-section clearfix"><div class="row"><div class="col-lg-12">' +
                   '<div class="medium-editor"></div>' +
               '</div></div></div></div>';

           _section_body.innerHTML = editorHTML;
           editor = new MediumEditor('.medium-editor');

           //wait, what? but why? how is it even supposed to be working? 
           window.MediumInsert = MediumInsert;
           $('.medium-editor').mediumInsert({
                editor: editor
           });
        }

        //$.cloudinary.config({ cloud_name: 'de1r9te3m', api_key: '634624764347287'});
   });

