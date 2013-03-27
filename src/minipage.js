// all, if true, includes child nodes
var wordcount = function(node, all) {
    var count = 0;
    if (all) {
        var words = $(node).text().match(/[A-z']+/g);
        if (words) {
            count += words.length;
        }            
    } else {
        $(node).contents().each(function(i, v) {
            if (v.nodeType === 3) {
                var words = $(node).text().match(/[A-z'0-9-]+/g);
                if (words) {
                    count += words.length;
                }        
            }  
        });
    }
    return count;
};

// container will hold mini page. If not specified, creates one in upper right corner
// target is element to minify. Default is body.
var minipage = function(opts) {
    if (!opts) { opts = {}; }
    if (!opts.target) {
        opts.target = document;
    } else if (typeof opts.target === "string") {
        if (opts.target[0] !== "#" && opts.target[0] !== ".") {
            opts.target = "#" + opts.target;
        }
        opts.target = $(opts.target)[0];
    }
    
    var scroll = $('#complete').offset().top;
    
    if (!opts.container) {
        opts.container = document.createElement("DIV");
        opts.container.className = "mini-container";
        document.body.appendChild(opts.container);
    } else if (typeof opts.container === "string") {
        if (opts.container[0] !== "#" && opts.container[0] !== ".") {
            opts.container = "#" + opts.container;
        }
        opts.container = $(opts.container)[0];
    }
        
    if (!opts.margin) { opts.margin = 3; }

    // it's a good idea to to build the minipage off the DOM first, 
    // so that the walk_to_DOM function doesn't crawl the nodes it creates even though it would ignore them
    var canvas = document.createElement("DIV");
    $(canvas).css({
        height: $(opts.container).height() - opts.margin * 2,
        margin: opts.margin
    }).attr("id", "mini-canvas");
    
    //nodes to draw
    var whitelist = {
        text: opts.textnodes || ["p", "li"],
        elements: opts.elementnodes || ["img"]
    };
    
    var width = $(opts.container).width() - opts.margin * 2,
        height = $(opts.container).height() - opts.margin * 2;

    var xscale = width / $(opts.target).width(),
        yscale = height / $(opts.target).height(),
        paper = Raphael(canvas, width, height),
        mat = paper.rect(0, 0, paper.width, paper.height).attr({
            stroke: 0,
            fill: "#FFF"
        }),
        shapes = paper.set();
        //yscale *= 0.8;

    function draw(node, myset, classname) {
        if (!myset) {
            myset = shapes;
        }
        //see if we have a text node (nodeType === 3) that is not blank        
        var tag = node.tagName ? node.tagName.toLowerCase() : "";
        
        if (whitelist.text.indexOf(tag) > -1 && wordcount(node, 0) > 0 || whitelist.elements.indexOf(tag) > -1) {
            var h = Math.max(3, $(node).height() * yscale),
                w = Math.max(3, $(node).width() * xscale),
                top = ($('#text').scrollTop() + $(node).offset().top) * yscale,
                left = $(node).position().left * xscale; 
                
            var rect = paper.rect(left, top, w, h);
            //var blank = paper.rect(0, top, left, h).attr({fill: "white", stroke: 'none' });
            
            if (tag === "span") {
                tag = "span-" + node.parentNode.tagName;    
            }

            var classes = ["mini-" + tag, "mini-" + (whitelist.text.indexOf(tag) > -1 ? "text" : "element")];
            if (classname) {
                classes.push(classname);
            }
            
            if ($(node).attr("class")) {
                classes.push("mini-" + $(node).attr("class"));
            }
            rect.node.setAttribute("class", classes.join(" "));

            rect.sibling = node;
            myset.push(rect);
            myset.transform("T0,-" + yscale * $(opts.container).offset().top);
        }
    }

    function make() {
        walk_the_DOM(opts.target, draw);
        $(opts.container).empty();
        $(opts.container).append(canvas);
    }
    
    make();
    
    //correct for offset of target
        
    return {
        make: function() {
            make();
        },
        get_shapes: function() {
            return shapes;
        },
        get_paper: function() {
            return paper;
        },
        get_mat: function() {
            return mat;  
        },
        scrolling: function(viewingpane) {
            //ties the minipage to a scrolling div, for in cases where the visualized div is inside a viewing window
            //TO DO (maybe)
            //Make default viewing pane the visible screen
        
            //amount of the rendered content visible at a given time
            var visibility = $(viewingpane).height() / $(opts.target).height();
    
            var pane = paper.rect(0, 0, paper.width, paper.height * visibility).attr({
                stroke: 0,
                fill: '#009900',
                opacity: 0.4
            }).drag(
                function(dx, dy, x, y, e) {
                    pane.attr("y", Math.max(0, Math.min($('#mini-canvas').height() * (1 - visibility), dy + this.oy)));
                    var place = this.attr("y") / $('#mini-canvas').height();
                    $('#text').scrollTop($('#complete').height() * place);
                },
                function(x, y, e) {
                    this.oy = this.attr("y");
                },
                function(e) {}    
            );
        
            //clicking a node scrolls to that point
            shapes.click(function (e) {
                $(viewingpane).animate({scrollTop:  $(this.sibling).position().top }, 200);    
            });    
    
            /*
            mini.get_mat().click(function(e) {
                var position = Math.max(0, Math.min($('#aerial').height() * (1 - visibility), e.layerY - pane.attr("height") / 2));
                pane.animate({ y: position}, 200);
                var place = position / $('#aerial').height();
                $('#text').animate({scrollTop: $('#complete').height() * place}, 200);    
            });
        */

            // pair preview pane to scrolling
            $(viewingpane).scroll(function () {
                var e = $(this).scrollTop();
                var pl = e / $('#complete').height();
                pane.attr("y", $('#mini-canvas').height() * pl);
            });                    
            
        },
        add: function(node, myset, classname) {
            draw(node, myset, classname);
        },
        hover: function(color) {
            shapes.hover(
                function() {
                    this.data("originalColor", $(this.sibling).css("background-color"));
                    $(this.sibling).css("background-color", color || "yellow");
                },
                function() {
                    $(this.sibling).css("background-color", this.data("originalColor"));
                }
            );
        }
    };
};