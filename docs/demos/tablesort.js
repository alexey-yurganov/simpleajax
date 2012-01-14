var TableSort = {
  showMenu: function(event) {
    var n = event.target;
    while(n && !/TD|TH/i.test(n.tagName)) n = n.parentNode;
    if(!n) return;

    var html = ["<select style='position:absolute;width:3em' onchange='TableSort.selectMenu(this);' onblur='TableSort.hideMenu(this);' onclick='event.preventDefault();event.stopPropagation();'><option value='x' selected>Select..."];
    html.push("<optgroup label='Sort'><option value='asc'>Ascending<option value='dsc'>Descending</optgroup>");
    html.push("<optgroup label='Show If'>");
    var filter = {fb:"equals", fc:"not equal", fd:"is greater than", fe:"is less than", ff:"begins with", fg:"not begins with", fh:"ends with", fi:"not ends with", fj:"contains", fk:"not contains"};
    for(var i in filter) html.push("<option value='"+i+"'>"+filter[i]);
    html.push("</optgroup><option value='all'>Show All</select>");

    var node = document.createElement("div");
    node.innerHTML = html.join("");
    node = node.firstChild;

    n.appendChild(node);

    node.focus();
    if(document.createEvent && node.dispatchEvent) {
      var o = document.createEvent("MouseEvents");
      o.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      node.dispatchEvent(o);
    } else node.click();
  },

  hideMenu: function(n, p) {
    setTimeout(function() {if((p = n.parentNode)) p.removeChild(n);}, 50);
  },

  selectMenu: function(n, i) {
    var s = n.value, title = n.options[n.selectedIndex].label;
    this.hideMenu(n);

    while(n && !/TD|TH/i.test(n.tagName)) n = n.parentNode;

    var tbl = n;
    while(tbl && !/TABLE|TBODY/i.test(tbl.tagName)) tbl = tbl.parentNode;
    tbl = tbl.rows;

    var tr = n.parentNode.cells;
    var idx = tr.length;
    while(--idx >= 0 && n != tr[idx]);

    var top = 0;
    while(/TH/i.test(tbl[top].cells[0].tagName)) top++;
    var len = tbl.length;

    if(s == "asc" || s == "dsc") {
      this._sort(tbl, idx, top, (s == "dsc"));

    } else if(s == "all") {
      for(var i=len - 1; i>=top; i--) tbl[i].style.display = "";

    } else if(s.charAt(0) == "f") {
      var param = prompt(title + ":");
      if(!param) return;

      if(s == "fb") {  //equals
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (tbl[i].cells[idx].innerText == param) ? "" : "none";
        }

      } else if(s == "fc") {  //not equal
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (tbl[i].cells[idx].innerText != param) ? "" : "none";
        }

      } else if(s == "fd") {  //is greater than
        param = parseFloat(param);
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (parseFloat(tbl[i].cells[idx].innerText.replace(/[^\d\.]/g,"")) > param) ? "" : "none";
        };

      } else if(s == "fe") {  //is less than
        param = parseFloat(param);
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (parseFloat(tbl[i].cells[idx].innerText.replace(/[^\d\.]/g,"")) < param) ? "" : "none";
        };

      } else if(s == "ff") {  //begins with
        for(var i=len - 1; i>=top; i--) {
        tbl[i].style.display = (tbl[i].cells[idx].innerText.indexOf(param) == 0) ? "" : "none";
        }

      } else if(s == "fg") {  //not begins with
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (tbl[i].cells[idx].innerText.indexOf(param) != 0) ? "" : "none";
        }

      } else if(s == "fh") {  //ends with
        var str;
        for(var i=len - 1; i>=top; i--) {
          str = tbl[i].cells[idx].innerText;
          tbl[i].style.display = (str.substr(str.length - param.length) == param) ? "" : "none";
        };

      } else if(s == "fi") {  //not ends with
        var str;
        for(var i=len - 1; i>=top; i--) {
          str = tbl[i].cells[idx].innerText;
          tbl[i].style.display = (str.substr(str.length - param.length) != param) ? "" : "none";
        };

      } else if(s == "fj") {  //contains
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (tbl[i].cells[idx].innerText.indexOf(param) >= 0) ? "" : "none";
        }

      } else if(s == "fk") {  //not contains
        for(var i=len - 1; i>=top; i--) {
          tbl[i].style.display = (tbl[i].cells[idx].innerText.indexOf(param) == -1) ? "" : "none";
        }
      }
    }
  },

  _sort: function(tbl, idx, top, rev) {
    var rows = [];
    var values = [];
    var val, nums = [];
    var len = tbl.length;

    for(var i=top; i<len; i++) {
      rows.push(tbl[i]);
      val = tbl[i].cells[idx].innerText;
      values.push(val);

      if(nums) {
        val = parseFloat(val.replace(/^\s|,/g, ""));
        nums.push(val);
        if(isNaN(val)) nums = null;
      }
    }

    if(nums) values = nums;

    for(var i=1; i<values.length; i++) {
      if(values[i - 1] > values[i]) {
        var j = i - 1;
        for(; j>=0; j--) {
          if(values[j] < values[i] || j == 0) {
            if(!(values[j] < values[i]) && j == 0) j = -1;

            rows.splice(j + 1, 0, rows[i]);
            values.splice(j + 1, 0, values[i]);
            rows.splice(i + 1, 1);
            values.splice(i + 1, 1);
            break;
          }
        }
      }
    }

    len = rows.length;
    for(var i=0; i<len; i++) {
      val = rev ? tbl[top + len - 1 - i] : tbl[top + i];
      if(val != rows[i]) val.parentNode.insertBefore(rows[i], val);
    }
  }
};

Array.prototype.forEach.call(document.querySelectorAll("table"), function(n) {
  n.onclick = function(e) {
    TableSort.showMenu(e);
  };
});

// javascript:void(document.body.appendChild(document.createElement('script')).src='http://simpleajax.googlecode.com/svn/docs/demos/tablesort.js');
alert("Click on a table to sort.");