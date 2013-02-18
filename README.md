Minipage
========

Draw a small representation of a webpage with Raphael

#Concept
It's often convenient for navigation to display a mini version of page as an inset. 
This tiny Javascript library draws that inset using [RaphaelJS](http://raphaeljs.com),
the fantastic SVG-generating library.

#Dependencies
[jQuery](http://jquery.com/)
[RaphaelJS 2.1.0](http://raphaeljs.com/)

#Installation
Minipage depends on two very small files:


#Options
```target```: Highest level node to represent in minipage. Default is ```document```
```container```: The node on which to draw the minipage. Default is a fixed 120px x 300px box in upper right with class ```mini-container````
```textnodes```: Array of tag types to draw if they contain text. Default is ```[p, li]```
```elementnodes```: Array of tag types to draw regardless of contents. Default is ```[img]```

#Styling
Each rectangle in the minipage is assigned two classes: ```mini-text``` or ```mini-element```, depending which list of nodes above it makes, and ```mini-[tag]```, where tag the tag type of the corresponding element on the page.