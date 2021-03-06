﻿Primrose.Entity = (function () {
  "use strict";
  
  var entityKeys = [],
  entities = new WeakMap();

  pliny.class({
    parent: "Primrose",
    name: "Entity",
    description: "The Entity class is the parent class for all 3D controls. It manages a unique ID for every new control, the focus state of the control, and performs basic conversions from DOM elements to the internal Control format."
  });
  class Entity {

    static registerEntity(e) {
      pliny.function({
        parent: "Primrose.Entity",
        name: "registerEntity",
        description: "Register an entity to be able to receive eyeBlank events.",
        parameters: [
          { name: "e", type: "Primrose.Entity", description: "The entity to register." }
        ]
      });
      entities.set(e.id, e);
      entityKeys.push(e.id);
      e.addEventListener("_idchanged", (evt) => {
        entityKeys.splice(entityKeys.indexOf(evt.oldID), 1);
        entities.delete(evt.oldID);
        entities.set(evt.entity.id, evt.entity);
        entityKeys.push(evt.entity.id);
      }, false);
    }

    static eyeBlankAll(eye) {
      pliny.function({
        parent: "Primrose.Entity",
        name: "eyeBlankAll",
        description: "Trigger the eyeBlank event for all registered entities.",
        parameters: [
          { name: "eye", type: "Number", description: "The eye to switch to: -1 for left, +1 for right."}
        ],
      });
      entityKeys.forEach((id) => {
        entities.get(id).eyeBlank(eye);
      });
    }

    constructor(id) {
      this.id = id;

      pliny.property({
        parent: "Primrose.Entity",
        name: "parent ",
        type: "Primrose.Entity",
        description: "The parent element of this eleemnt, if this element has been added as a child to another element."
      });
      this.parent = null;

      pliny.property({
        parent: "Primrose.Entity",
        name: "children",
        type: "Array",
        description: "The child elements of this element."
      });
      this.children = [];

      pliny.property({
        parent: "Primrose.Entity",
        name: "focused",
        type: "Boolean",
        description: "A flag indicating if the element, or a child element within it, has received focus from the user."
      });
      this.focused = false;

      pliny.property({
        parent: "Primrose.Entity",
        name: "focusable",
        type: "Boolean",
        description: "A flag indicating if the element, or any child elements within it, is capable of receiving focus."
      });
      this.focusable = true;

      pliny.property({
        parent: "Primrose.Entity",
        name: "listeners",
        type: "Object",
        description: "The event listener container, holding the callbacks to trigger for each type of event."
      });
      this.listeners = {
        focus: [],
        blur: [],
        click: [],
        keydown: [],
        keyup: [],
        paste: [],
        copy: [],
        cut: [],
        wheel: [],
        _idchanged: []
      };

      pliny.event({
        parent: "Primrose.Entity",
        name: "focus",
        description: "If the element is focusable, occurs when the user clicks on an element for the first time, or when a program calls the `focus()` method."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "blur",
        description: "If the element is focused (which implies it is also focusable), occurs when the user clicks off of an element, or when a program calls the `blur()` method."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "click",
        description: "Occurs whenever the user clicks on an element."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "keydown",
        description: "Occurs when the user pushes a key down while focused on the element."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "keyup",
        description: "Occurs when the user releases a key while focused on the element."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "paste",
        description: "Occurs when the user activates the clipboard's `paste` command while focused on the element."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "cut",
        description: "Occurs when the user activates the clipboard's `cut` command while focused on the element."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "copy",
        description: "Occurs when the user activates the clipboard's `copy` command while focused on the element."
      });

      pliny.event({
        parent: "Primrose.Entity",
        name: "wheel",
        description: "Occurs when the user scrolls the mouse wheel while focused on the element."
      });
    }

    get id() {
      pliny.property({
        parent: "Primrose.Entity",
        name: "id ",
        type: "String",
        description: "Get or set the id for the control."
      });
      return this._id;
    }

    set id(v) {
      var oldID = this._id;
      this._id = new String(v);
      emit.call(this, "_idchanged", {
        oldID: oldID,
        entity: this
      });
    }

    addEventListener(event, func) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "addEventListener",
        description: "Adding an event listener registers a function as being ready to receive events.",
        parameters: [
        { name: "evt", type: "String", description: "The name of the event for which we are listening." },
        { name: "thunk", type: "Function", description: "The callback to fire when the event occurs." }
        ],
        examples: [{
          name: "Add an event listener.",
          description: "The `addEventListener()` method operates nearly identically to the method of the same name on DOM elements.\n\
\n\
    grammar(\"JavaScript\");\n\
    var txt = new Primrose.Text.Controls.TextBox();\n\
    txt.addEventListener(\"mousemove\", console.log.bind(console, \"mouse move\"));\n\
    txt.addEventListener(\"keydown\", console.log.bind(console, \"key down\"));"
        }]
      });
      if (this.listeners[event]) {
        this.listeners[event].push(func);
      }
    }

    removeEventListener(event, func) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "removeEventListener",
        description: "Removing an event listener so that it no longer receives events from this object. Note that it must be the same function instance that was used when the event listener was added.",
        parameters: [
        { name: "evt", type: "String", description: "The name of the event from which we are removing." },
        { name: "thunk", type: "Function", description: "The callback to remove." }
        ],
        examples: [{
          name: "Remove an event listener.",
          description: "The `removeEventListener()` method operates nearly identically to the method of the same name on DOM elements.\n\
\n\
    grammar(\"JavaScript\");\n\
    var txt = new Primrose.Text.Controls.TextBox(),\n\
    func = console.log.bind(console, \"mouse move\");\n\
    txt.addEventListener(\"mousemove\", func);\n\
    txt.removeEventListener(\"mousemove\", func);"
        }]
      });
      const evts = this.listeners[event];
      if (evt) {
        const i = evts.indexOf(func);
        if (0 <= i && i < evts.length) {
          evts.splice(i, 1);
        }
      }
    }

    focus() {
      pliny.method({
        parent: "Primrose.Entity",
        name: "focus",
        description: "If the control is focusable, sets the focus property of the control, does not change the focus property of any other control.",
        examples: [{
          name: "Focus on one control, blur all the rest",
          description: "When we have a list of controls and we are trying to track focus between them all, we must coordinate calls between `focus()` and `blur()`.\n\
\n\
    grammar(\"JavaScript\");\n\
    var ctrls = [\n\
    new Primrose.Text.Controls.TextBox(),\n\
    new Primrose.Text.Controls.TextBox(),\n\
    new Primrose.Text.Button()\n\
    ];\n\
    \n\
    function focusOn(id){\n\
      for(var i = 0; i < ctrls.length; ++i){\n\
        var c = ctrls[i];\n\
        if(c.controlID === id){\n\
          c.focus();\n\
        }\n\
        else{\n\
          c.blur();\n\
        }\n\
      }\n\
    }"
        }]
      });
      if(this.focusable){
        this.focused = true;
        emit.call(this, "focus", { target: this });
      }
    }

    blur() {
      pliny.method({
        parent: "Primrose.Entity",
        name: "blur",
        description: "If the element is focused, unsets the focus property of the control and all child controls. Does not change the focus property of any parent or sibling controls.",
        examples: [{
          name: "Focus on one control, blur all the rest",
          description: "When we have a list of controls and we are trying to track focus between them all, we must coordinate calls between `focus()` and `blur()`.\n\
\n\
    grammar(\"JavaScript\");\n\
    var ctrls = [\n\
    new Primrose.Text.Controls.TextBox(),\n\
    new Primrose.Text.Controls.TextBox(),\n\
    new Primrose.Text.Button()\n\
    ];\n\
    \n\
    function focusOn(id){\n\
      for(var i = 0; i < ctrls.length; ++i){\n\
        var c = ctrls[i];\n\
        if(c.controlID === id){\n\
          c.focus();\n\
        }\n\
        else{\n\
          c.blur();\n\
        }\n\
      }\n\
    }"
        }]
      });
      if(this.focused){
        this.focused = false;
        for (var i = 0; i < this.children.length; ++i) {
          if (this.children[i].focused) {
            this.children[i].blur();
          }
        }
        emit.call(this, "blur", { target: this });
      }
    }

    appendChild(child) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "appendChild",
        description: "Adds an Entity as a child entity of this entity.",
        parameters: [
        {name: "child", type: "Primrose.Entity", description: "The object to add. Will only succeed if `child.parent` is not set to a value." }
        ],
        examples: [{
          name: "Add an entity to another entity",
          description: "Entities can be arranged in parent-child relationships.\n\
\n\
    grammar(\"JavaScript\");\n\
    var a = new Primrose.Entity(),\n\
    b = new Primrose.Entity();\n\
    a.appendChild(b);\n\
    console.assert(a.children.length === 1);\n\
    console.assert(a.children[0] === b);\n\
    console.assert(b.parent === a);"
        }]
      });
      if (child && !child.parent) {
        child.parent = this;
        this.children.push(child);
      }
    }

    removeChild(child) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "removeChild",
        description: "Removes an Entity from another Entity of this entity.",
        parameters: [
        { name: "child", type: "Primrose.Entity", description: "The object to remove. Will only succeed if `child.parent` is this object." }
        ],
        examples: [{
          name: "Remove an entity from another entity",
          description: "Entities can be arranged in parent-child relationships.\n\
\n\
    grammar(\"JavaScript\");\n\
    var a = new Primrose.Entity(),\n\
    b = new Primrose.Entity();\n\
    a.appendChild(b);\n\
    console.assert(a.children.length === 1);\n\
    console.assert(a.children[0] === b);\n\
    console.assert(b.parent === a);\n\
    a.removeChild(b);\n\
    console.assert(a.children.length === 0)\n\
    console.assert(b.parent === null);"
        }]
      });
      const i = this.children.indexOf(child);
      if (0 <= i && i < this.children.length) {
        this.children.splice(i, 1);
        child.parent = null;
      }
    }

    get theme() {
      pliny.property({
        parent: "Primrose.Entity",
        name: "theme",
        type: "Primrose.Text.Themes.*",
        description: "Get or set the theme used for rendering text on any controls in the control tree."
      });
      return null;
    }

    set theme(v) {
      for (var i = 0; i < this.children.length; ++i) {
        this.children[i].theme = v;
      }
    }

    get lockMovement() {
      pliny.property({
        parent: "Primrose.Entity",
        name: "lockMovement",
        type: "Boolean",
        description: "Recursively searches the deepest leaf-node of the control graph for a control that has its `lockMovement` property set to `true`, indicating that key events should not be used to navigate the user, because they are being interpreted as typing commands."
      });
      var lock = false;
      for (var i = 0; i < this.children.length && !lock; ++i) {
        lock |= this.children[i].lockMovement;
      }
      return lock;
    }

    get focusedElement() {
      pliny.property({
        parent: "Primrose.Entity",
        name: "focusedElement",
        type: "Primrose.Entity",
        description: "Searches the deepest leaf-node of the control graph for a control that has its `focused` property set to `true`."
      });
      var result = null,
        head = this;
      while(head && head.focused){
        result = head;
        var children = head.children;
        head = null;
        for(var i = 0; i < children.length; ++i){
          var child = children[i];
          if(child.focused){
            head = child;
          }
        }
      }
      return result;
    }

    eyeBlank(eye) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "eyeBlank",
        parameters: [
          { name: "eye", type: "Number", description: "The eye to switch to: -1 for left, +1 for right."}
        ],
        description: "Instructs any stereoscopically rendered surfaces to change their rendering offset."
      });
      for (var i = 0; i < this.children.length; ++i) {
        this.children[i].eyeBlank(eye);
      }
    }

    _forFocusedChild(name, evt) {
      var elem = this.focusedElement;
      if (elem && elem !== this) {
        elem[name](evt);
      }
    }

    startDOMPointer(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "startDOMPointer",
        parameters: [
          { name: "evt", type: "Event", description: "The pointer event to read"}
        ],
        description: "Hooks up to the window's `mouseDown` and `touchStart` events and propagates it to any of its focused children."
      });
      for (var i = 0; i < this.children.length; ++i) {
        this.children[i].startDOMPointer(evt);
      }
    }

    moveDOMPointer(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "moveDOMPointer",
        parameters: [
          { name: "evt", type: "Event", description: "The pointer event to read"}
        ],
        description: "Hooks up to the window's `mouseMove` and `touchMove` events and propagates it to any of its focused children."
      });
      this._forFocusedChild("moveDOMPointer", evt);
    }

    startUV(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "startUV",
        parameters: [
          { name: "evt", type: "Event", description: "The pointer event to read"}
        ],
        description: "Hooks up to the window's `mouseDown` and `touchStart` events, with coordinates translated to tangent-space UV coordinates, and propagates it to any of its focused children."
      });
      this._forFocusedChild("startUV", evt);
    }

    moveUV(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "moveUV",
        parameters: [
          { name: "evt", type: "Event", description: "The pointer event to read"}
        ],
        description: "Hooks up to the window's `mouseMove` and `touchMove` events, with coordinates translated to tangent-space UV coordinates, and propagates it to any of its focused children."
      });
      this._forFocusedChild("moveUV", evt);
    }

    endPointer() {
      pliny.method({
        parent: "Primrose.Entity",
        name: "endPointer",
        description: "Hooks up to the window's `mouseUp` and `toucheEnd` events and propagates it to any of its focused children."
      });
      this._forFocusedChild("endPointer");
    }

    keyDown(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "keyDown",
        parameters: [
          { name: "evt", type: "Event", description: "The key event to read"}
        ],
        description: "Hooks up to the window's `keyDown` event and propagates it to any of its focused children."
      });
      this._forFocusedChild("keyDown", evt);
    }

    keyUp(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "keyUp",
        parameters: [
          { name: "evt", type: "Event", description: "The key event to read"}
        ],
        description: "Hooks up to the window's `keyUp` event and propagates it to any of its focused children."
      });
      this._forFocusedChild("keyUp", evt);
    }

    readClipboard(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "readClipboard",
        parameters: [
          { name: "evt", type: "Event", description: "The clipboard event to read"}
        ],
        description: "Hooks up to the clipboard's `paste` event and propagates it to any of its focused children."
      });
      this._forFocusedChild("readClipboard", evt);
    }

    copySelectedText(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "copySelectedText",
        parameters: [
          { name: "evt", type: "Event", description: "The clipboard event to read"}
        ],
        description: "Hooks up to the clipboard's `copy` event and propagates it to any of its focused children."
      });
      this._forFocusedChild("copySelectedText", evt);
    }

    cutSelectedText(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "cutSelectedText",
        parameters: [
          { name: "evt", type: "Event", description: "The clipboard event to read"}
        ],
        description: "Hooks up to the clipboard's `cut` event and propagates it to any of its focused children."
      });
      this._forFocusedChild("cutSelectedText", evt);
    }

    readWheel(evt) {
      pliny.method({
        parent: "Primrose.Entity",
        name: "readWheel",
        parameters: [
          { name: "evt", type: "Event", description: "The wheel event to read"}
        ],
        description: "Hooks up to the window's `wheel` event and propagates it to any of its focused children."
      });
      this._forFocusedChild("readWheel", evt);
    }
  }
  return Entity;
})();
