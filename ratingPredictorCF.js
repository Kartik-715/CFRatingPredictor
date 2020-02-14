// ==UserScript==
// @name         CF-Predictor
// @version      1.2.4
// @description  This extension predicts rating changes for Codeforces. It shows approximate deltas during and after the contest.
// @author       Originally by WslF, Edited by Kartik_715
// @match        *://codeforces.com/contest/*/standings*
// @connect      cf-predictor-frontend.herokuapp.com
// @namespace    https://greasyfork.org/users/169007
// ==/UserScript==

function addJQuery(callback) 
{
  var script = document.createElement("script");
  script.setAttribute("src", "//ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "window.jQ=jQuery.noConflict(true);(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

function main() 
{
    "use strict" ; 
    var partyNum = 0;
    var results = [];
      showDeltas();

    function modifyPartyHtml(index, elem) {
        var delta = '?';
        var rank = ' ';
        var seed = ' ';

        if (partyNum > 0) {
            var handle = $(elem).find("td:eq(1)").find("a").last().html();
            if (handle) {
                //next 2 lines - fix for legendary grandmaster
                handle = handle.replace('<span class="legendary-user-first-letter">','');
                handle = handle.replace('</span>','');
                if (handle in results) {
                    delta = results[handle].delta;
                    rank = results[handle].rank;
                    seed = results[handle].seed;
                }
            }
        }

        var darkClass = "";
        if (partyNum % 2 == 1) {
            darkClass = "dark ";
        }
        var text;
        if (partyNum == 0) {
            text = "<th class='top right' style='width: 4em;'><span title='Rating change''>&Delta;</span></th>";
        } else {
            if (delta > 0) {
                text = "<td class='" + darkClass + "right'><span style='color:green;font-weight:bold;'>+" + delta + "</span></td>";
            } else {
                text = "<td class='" + darkClass + "right'><span style='color:gray;font-weight:bold;'>" + delta + "</span></td>";
            }
        }

        partyNum++;
        $(elem).append(text);
    }

    function showDeltas() 
    {
        console.log("IN SHOW DELTAS") ; 
        var count = $(".standings").find("tr").length;
      console.log(count) ; 
        if (count > 2) 
        {  
            console.log("Getting contest ID") ; 
            var contestId = document.location.href.replace(/\D+/ig, ',').substr(1).split(',')[0];
            getDeltas(contestId, function() {
                $(".standings").find("tr").first().find("th").last().removeClass("right");
                $(".standings").find("tr").find("td").removeClass("right");
                $(".standings").find("tr").each(modifyPartyHtml);
                if (count % 2 == 0) {
                    $(".standings").find("tr").last().find("td").last().replaceWith("<td class='smaller bottom right dark'>&Delta;</td>");
                } else {
                    $(".standings").find("tr").last().find("td").last().replaceWith("<td class='smaller bottom right'>&Delta;</td>");
                }
            });
        }
    }

    function getDeltas(contestId, callback) 
  {
        //var localServer = "http://localhost:8084/CF-PredictorFrontEnd/"
        var herokuServer = "https://cf-predictor-frontend.herokuapp.com/";
        var page =  "GetNextRatingServlet?contestId=" + contestId;
        

        var server = herokuServer + page;
    
        var xhttp = new XMLHttpRequest() ; 
        xhttp.onreadystatechange = function() 
        {
                if(this.readyState == 4 && this.status == 200)
                {
                    console.log("GOT THE RESULTS") ; 
                    var text = xhttp.responseText;
                    var data = JSON.parse(text);
                    for (var i = 0; i < data.result.length; i++) 
                    {
                        var handle = data.result[i].handle;
                        var delta = data.result[i].newRating - data.result[i].oldRating;
                        var rank = data.result[i].rank;
                        var seed = data.result[i].seed;
                        var ret = {
                            delta : parseInt(delta),
                            seed : parseInt(seed),
                            rank : parseInt(rank)
                        };
                        results[handle] = ret;
                    }
                    callback();
                }
                
        }

        xhttp.open("GET", server, true) ; 
        xhttp.send() ;
    }
};

addJQuery(main) ;




