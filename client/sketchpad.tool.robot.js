// @license magnet:?xt=urn:btih:0b31508aeb0634b347b8270c7bee4d411b5d4109&dn=agpl-3.0.txt AGPL-3 https://www.gnu.org/licenses/agpl-3.0-standalone.html
/**
 * @source: http://developers.sketchpad.pro/dist/src/sketchpad.tool.line.js
 *
 * Sketchpad.pro
 * {@link http://sketchpad.pro|Sketchpad.pro - drawing board sketch free}
 *
 * @copyright 2016-2017 positivestudio.co
 * @version 0.5.1
 * @author positivestudio.co
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2016  positivestudio.co
 *
 *  Sketchpad.pro - drawing board sketch pad
 *  Copyright (C) 2016  positivestudio.co
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 * @file Inputs stack
 *
 * Date: 2016-08-11T14:00Z
 */

// alert("robot");
/*global NSSketchpad, Input, Tool*/
/*global fetch, window*/
function sendToRobot(nextPos) {
    "use strict";
    // fetch("http://192.168.0.32/forward/" + parseInt(move.distance, 10));
    // var roboAngle = (parseInt(nextPos.angle2, 10));
    // var angleDeg = parseInt((Math.atan2(nextPos.y - nextPos.lastY, nextPos.x - nextPos.lastX) * 180 / Math.PI + 180) - nextPos.lastAngle, 10);

    var command = "go/" + parseInt(nextPos.angle, 10) + "/" + parseInt(nextPos.distance, 10);
    console.log("COMMAND:%c", "color:red", command);
    fetch("http://192.168.0.32/" + command).then(function success() {
        console.log("success", command);
    }, function error() {
        console.error("ignore:error", command);
    });
}
window.sendToRobot = sendToRobot;
function ToolRobot(config) {
    "use strict";
    Tool.call(this, config);
    this.toolId = config.toolId || "line";
    // console.log("new rect", this);
}

ToolRobot.prototype = Object.create(Tool.prototype);

Object.assign(ToolRobot.prototype, {
    color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
    },
    // toolLabel: "╱",
    toolLabel: "Robot",
    toolKey: "x",
    toolId: "robot",
    lineWidth: 1,
    keyCode: 88, //x
    lastPosition: {
        x: 0,
        y: 0,
        absoluteAngle: 180,
        angle: 0
    },
    /**
     * [startInput description]
     * @memberof ToolRobot#
     * @param  {any} id - unique id in current moment
     * @param  {integer} x  - x coordinate
     * @param  {integer} y  - y coordinate
     * @return {Input} - returns new Input for current tool touch
     */
    startInput: function startPath(id, x, y, e) {
        "use strict";
        x = this.lastPosition.x;
        y = this.lastPosition.y;

        if (e.altKey) {
            x = Math.round(x / 10) * 10;
            y = Math.round(y / 10) * 10;
        }

        // console.log("Robot Start", id, x, y);
        var sketchpad = this.sketchpad;
        var input = new Input({
            sketchpad: sketchpad,
            id: id,
            tool: this.toolId,
            color: this.getColorStr(),
            size: this.lineWidth,
            layers: this.layers
        });

        input.selectorDiv = document.createElement("div");
        input.selectorDiv.style.position = "absolute";
        input.selectorDiv.style.display = "block";
        input.selectorDiv.style.backgroundColor = this.getColorStr();
        if (this.sketchpad.centerViewport) {
            input.selectorDiv.style.left = this.sketchpad.width / 2 + x + "px";
            input.selectorDiv.style.top = this.sketchpad.height / 2 + y + "px";
        } else {
            input.selectorDiv.style.left = x + "px";
            input.selectorDiv.style.top = y + "px";
        }
        input.selectorDiv.style.width = "1px";
        var height = this.getSize();
        if (height < 1) {
            input.selectorDiv.style.borderTop = "1px dashed " + this.getColorStr();
        }
        input.selectorDiv.style.height = height + "px";
        // input.selectorDiv.style.lineHeight = "1px";
        input.startX = x;
        input.startY = y;
        sketchpad.containerEl.appendChild(input.selectorDiv);


        input.addPoint(new Date().getTime(), x, y);
        return input;
    },

    /**
     * Style div to connect two points
     * @memberof ToolRobot#
     * @param  {HTMLElement} el        [description]
     * @param  {number} x1        [description]
     * @param  {number} y1        [description]
     * @param  {number} x2        [description]
     * @param  {number} y2        [description]
     * @param  {number} thickness [description]
     * @return {undefined}           [description]
     */
    connect: function connect(el, x1, y1, x2, y2, thickness) {
        "use strict";
        // distance
        var length = Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
        // center
        var cx = ((x1 + x2) / 2) - (length / 2);
        var cy = ((y1 + y2) / 2) - (thickness / 2);
        // angle
        var angle = Math.atan2((y1 - y2), (x1 - x2)) * (180 / Math.PI);
        // make hr
        if (this.sketchpad.centerViewport) {
            el.style.left = this.sketchpad.width / 2 + cx + "px";
            el.style.top = this.sketchpad.height / 2 + cy + "px";
        } else {
            el.style.left = cx + "px";
            el.style.top = cy + "px";
        }

        el.style.width = length + "px";
        el.style.transform = "rotate(" + angle + "deg)";
        el.style.webkitTransform = "rotate(" + angle + "deg)";
        el.style.MozTransform = "rotate(" + angle + "deg)";
        el.style.msTransform = "rotate(" + angle + "deg)";
        el.style.OTransform = "rotate(" + angle + "deg)";
    },

    /**
     * [moveInput description]
     * @memberof ToolRobot#
     * @param  {Input} input - [description]
     * @param  {number} x -    [description]
     * @param  {number} y -   [description]
     * @param  {HTMLEvent} e -    [description]
     * @return {undefined}       [description]
     */
    moveInput: function drawPath(input, x, y, e) {
        "use strict";
        if (e.altKey) {
            x = Math.round(x / 10) * 10;
            y = Math.round(y / 10) * 10;
        }
        // console.log("Robot Move", input, x, y);
        var firstX = input.startX;
        var firstY = input.startY;

        if (e.shiftKey) {
            var dx = x - firstX;
            var dy = y - firstY;
            var distance = this.distance(firstX, firstY, x, y);
            var angle = Math.round(Math.atan2(dx, dy) / (Math.PI / 4)) * (Math.PI / 4);
            x = firstX + distance * Math.sin(angle);
            y = firstY + distance * Math.cos(angle);
        }

        var sx = firstX;
        var sy = firstY;
        var ex = x;
        var ey = y;
        var dx = ex - sx;
        var dy = ey - sy;
        var angle = Math.atan2(dx, dy) * 180 / Math.PI;
        console.log(angle);

        this.connect(input.selectorDiv, sx, sy, ex, ey, this.getSize());
    },

    sendRobotCommand: function sendRobotCommand(move) {
        "use strict";
        // console.log("MOVE", move);
        sendToRobot(move);
        this.lastPosition = move;
    },
    /**
     * [finishInput description]
     * @memberof ToolRobot#
     * @param  {Input} input - [description]
     * @param  {number} x -    [description]
     * @param  {number} y -   [description]
     * @param  {HTMLEvent} e -    [description]
     * @return {undefined}       [description]
     */
    finishInput: function endPath(input, x, y, e) {
        "use strict";
        if (e.altKey) {
            x = Math.round(x / 10) * 10;
            y = Math.round(y / 10) * 10;
        }

        var sketchpad = this.sketchpad;
        // console.log("Robot End", input, x, y);
        var firstX = input.startX;
        var firstY = input.startY;

        if (e.shiftKey) {
            var dx = x - firstX;
            var dy = y - firstY;
            var distance = this.distance(firstX, firstY, x, y);
            var angle = Math.round(Math.atan2(dx, dy) / (Math.PI / 4)) * (Math.PI / 4);
            x = firstX + distance * Math.sin(angle);
            y = firstY + distance * Math.cos(angle);
        }

        input.addPoint(new Date().getTime(), x, y);
        var x1 = this.lastPosition.x,
            y1 = this.lastPosition.y,
            x2 = x,
            y2 = y,
            sdx = x2 - x1,
            sdy = y2 - y1;
        var absoluteAngle = Math.atan2(sdx, sdy) * 180 / Math.PI;
        var newPosition = {
            lastX: this.lastPosition.x,
            lastY: this.lastPosition.y,
            lastAngle: this.lastPosition.angle,
            x: x,
            y: y,
            distance: this.distance(this.lastPosition.x, this.lastPosition.y, x, y),
            absoluteAngle: absoluteAngle,
            angle: absoluteAngle - this.lastPosition.absoluteAngle
        };
        this.sendRobotCommand(newPosition);
        // this.lastPosition = newPosition;
        sketchpad.containerEl.removeChild(input.selectorDiv);
    },

    /**
     * Draw engine
     * @memberof ToolRobot#
     * @param  {object} Drawing parameters
     * @param  {object} List of points to draw
     * @return {undefined}
     */
    drawFramePath: function drawFramePath(config, points) {
        "use strict";
        var toolConfig = config.cnf;
        var sketchpad = this.sketchpad,
            ll,
            context;


        if (!toolConfig.lay || !toolConfig.lay.length) {
            console.warn("no layers to draw");
            return;
        }
        // var p1, p2;
        for (ll = 0; ll < toolConfig.lay.length; ll += 1) {
            switch (toolConfig.lay[ll]) {
            case sketchpad.LAYER_BACK:
                context = sketchpad.contextB2D;
                break;
            case sketchpad.LAYER_FRONT:
                context = sketchpad.context2D;
                break;
            default:
                context = sketchpad.context2D;
            }
            context.save();
            context.rotate(sketchpad.rotation * Math.PI / 180);
            context.scale(sketchpad.scale, sketchpad.scale);
            context.translate(config.vpx, config.vpy);
            context.translate(-sketchpad.viewportX, -sketchpad.viewportY);
            context.scale(1 / config.scl, 1 / config.scl);
            context.rotate(-config.rot * Math.PI / 180);

            context.beginPath();
            context.lineCap = "butt";
            context.lineJoin = "round";
            context.strokeStyle = toolConfig.col;
            context.lineWidth = toolConfig.siz;
            context.moveTo(points.x[0], points.y[0]);
            context.lineTo(points.x[1], points.y[1]);
            context.stroke();
            context.restore();
        }


    }
});
NSSketchpad.avaliableTools.push(ToolRobot);
