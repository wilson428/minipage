//See Javascript: The Good Parts, page 25
var walk_the_DOM = function walk(node, func) {
    func(node);
    node = node.firstChild;
    while (node) { 
        walk(node, func); 
        node = node.nextSibling; 
    }
};

var wordcount = function(node) {
    var count = 0;
    walk_the_DOM(node, function(node) {
        if (node.nodeType === 3) {
            var words = node.nodeValue.match(/[A-z']+/g);
            if (words) {
                count += words.length;
            }            
        }
    });
    return count;
};

// container will hold mini page. If not specified, creates one in upper right corner
// target is element to minify. Default is body.
var minipage = function(opts) {
    if (!opts) { opts = {}; }
    if (!opts.target) {
        opts.target = document;
    }
    if (!opts.container) {
        opts.container = document.createElement("DIV");
        opts.container.className = "mini-container";
        document.body.appendChild(opts.container);
    } else if (typeof opts.container === "String") {
        if (opts.container[0] !== "#") {
            opts.container = "#" + opts.container;
        }
        opts.container = $(opts.container);
    }
        
    // it's a good idea to to build the minipage off the DOM first, so that the walk_to_DOM function doesn't crawl the nodes it creates even though it would ignore them
    var holder = document.createElement("DIV");

    //nodes to draw
    var whitelist = {
        text: opts.textnodes || ["p", "li"],
        elements: opts.elementnodes || ["img"]
    };
        
    var xscale = $(opts.container).width() / $(opts.target).width(),
        yscale = $(opts.container).height() / $(opts.target).height(),
        paper = Raphael(holder),
        shapes = paper.set();

    function draw(node) {
        //see if we have a text node (nodeType === 3) that is not blank        
        var tag = node.tagName ? node.tagName.toLowerCase() : "";
        if (whitelist.text.indexOf(tag) > -1 && wordcount(node) > 0 || whitelist.elements.indexOf(tag) > -1) {
            //console.log(node);
            var h = node.offsetHeight * yscale,
                w = node.offsetWidth * xscale,
                top = $(node).offset().top * yscale,
                left = $(node).offset().left * xscale; 
                
            var rect = paper.rect(left, top, w, h);
            rect.node.setAttribute("class", "mini-" + tag + " mini-" + (whitelist.text.indexOf(tag) > -1 ? "text" : "element"));
            rect.sibling = node;
            shapes.push(rect);
        }
    }

    function make() {
        walk_the_DOM(opts.target, draw);
        $(opts.container).empty();
        $(opts.container).append(holder);
    }
    
    make();

    return {
        make: function() {
            make();
        },
        get_shapes: function() {
            return shapes;
        }
    };
};